"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { submitReviewAction } from "@/app/actions/reviews";
import { supabase } from "@/lib/supabase";

export default function ReviewModal({ isOpen, onClose, boardName }) {
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
      setError("You must be logged in to submit a review.");
      return;
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
      token: session.access_token
    };

    try {
      const res = await submitReviewAction(payload);
      if (res.success) {
        setIsSuccess(true);
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
              Review Submitted!
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              Thank you for sharing your experience. Your review has been sent to our team for approval and will be visible shortly.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all text-sm w-full"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              Write a Review for {boardName}
            </h3>
            
            {!session && !loadingAuth ? (
              <div className="py-8 text-center border-t border-slate-100 mt-6">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Login Required</h4>
                <p className="text-slate-500 font-medium mb-6 text-sm">You must be signed in to submit a review and help the community.</p>
                <div className="flex gap-3">
                  <Link href="/join" className="flex-1 py-3 bg-[#FF5630] text-white font-black rounded-2xl hover:scale-105 transition-all text-sm block">
                    Join for Free
                  </Link>
                  <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-2xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 font-medium mb-8">
                  Share your experience to help others make better hiring decisions.
                </p>

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
