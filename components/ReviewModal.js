"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitReviewAction } from "@/app/actions/reviews";
import { supabase } from "@/lib/supabase";

// Signed-in members' reviews publish instantly; guests give an email and
// pass the spam check, and their review waits for approval.
export default function ReviewModal({ isOpen, onClose, boardName }) {
  const router = useRouter();
  const [guestEmail, setGuestEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [result, setResult] = useState(null); // { status, ownerMatch }
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formLoadTime, setFormLoadTime] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormLoadTime(Date.now());
      setIsSuccess(false);
      setError("");
      setRating(0);
      setTitle("");
      setReviewText("");
      setResult(null);
      setTurnstileToken("");

      setLoadingAuth(true);
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoadingAuth(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    if (!session) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        setError("Please enter your email address.");
        return;
      }
      if (!turnstileToken) {
        setError("Please complete the security check.");
        return;
      }
    }
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (reviewText.trim().length < 10) {
      setError("Please write at least 10 characters for your review.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      boardName,
      rating,
      title,
      reviewText,
      formLoadTime,
      website_hp: honeypot,
      token: session?.access_token || null,
      guestEmail: session ? null : guestEmail.trim(),
      turnstileToken: session ? null : turnstileToken,
    };

    try {
      const res = await submitReviewAction(payload);
      if (res.success) {
        setResult({ status: res.status, ownerMatch: res.ownerMatch });
        setIsSuccess(true);
        // The server already refreshed the page's data; re-render it now.
        if (res.status === "approved") router.refresh();
      } else {
        setError(res.error || "Failed to submit review.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] p-10 max-w-lg w-full mx-4 card-shadow animate-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✓
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">
              {result?.status === "approved" ? "Your review is live!" : "Review received"}
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              {result?.status === "approved"
                ? `Thanks for helping other recruiters. Your review is now on the ${boardName} page.`
                : result?.ownerMatch
                  ? `Your email matches ${boardName}'s own domain, so our team checks this review before it goes live. We'll email you when it does.`
                  : "Thanks! Reviews from guests are checked by our team before they go live. We'll email you when yours is published. Sign in next time to publish instantly."}
            </p>
            <button
              onClick={() => {
                onClose();
                if (result?.status === "approved") {
                  document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all text-sm w-full"
            >
              {result?.status === "approved" ? "See my review" : "Close"}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              Write a Review for {boardName}
            </h3>
            
            {(
              <>
                <p className="text-sm text-slate-500 font-medium mb-6">
                  Share your experience to help others make better hiring decisions.
                </p>

                {!session && !loadingAuth && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900 font-medium">
                    <Link href="/join" className="font-black underline">Sign in</Link> to see your review published
                    instantly. Reviews from guests are checked by our team first.
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                      {error}
                    </div>
                  )}

                  {/* Honeypot field (hidden) */}
                  <input 
                    type="text" 
                    name="website_hp" 
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }} 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      Your Rating
                    </label>
                    <div 
                      className="flex gap-1 text-2xl"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span 
                          key={i} 
                          className={`cursor-pointer transition-colors ${
                            i <= (hoverRating || rating) ? "text-amber-400" : "text-slate-300"
                          }`}
                          onMouseEnter={() => setHoverRating(i)}
                          onClick={() => setRating(i)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      Review Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Summarize your experience..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF5630]/10"
                    />
                  </div>
                  {!session && !loadingAuth && (
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF5630]/10"
                      />
                      <p className="mt-1.5 text-xs text-slate-400 font-medium">Never shown publicly. We email you when your review is published.</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      Your Review
                    </label>
                    <textarea
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you like or dislike?"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF5630]/10 resize-none"
                    />
                  </div>
                  {!session && !loadingAuth && (
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken("")}
                    />
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || loadingAuth}
                    className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
