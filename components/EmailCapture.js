"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mocking submission behavior by storing in local storage
      let storedEmails = [];
      try {
        const stored = localStorage.getItem("jbr_subscribed_emails");
        if (stored) {
          storedEmails = JSON.parse(stored);
        }
      } catch (err) {
        console.error("Local storage access error:", err);
      }

      if (!storedEmails.includes(trimmedEmail)) {
        storedEmails.push(trimmedEmail);
        localStorage.setItem("jbr_subscribed_emails", JSON.stringify(storedEmails));
      }

      // 800ms delay for premium loading experience
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 text-center max-w-3xl mx-auto">
      <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight">
        Stop guessing. <br /> <span className="text-[#FF5630]">Start hiring smarter.</span>
      </h2>
      
      {!isSubmitted ? (
        <>
          <p className="text-xl text-slate-400 mb-14 font-medium leading-relaxed">
            Join recruiters, staffing agencies, and hiring teams using JobBoardsReview to discover better job boards, recruiting tools, and sourcing platforms.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-5 justify-center items-start max-w-lg mx-auto">
            <div className="flex-1 w-full text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Your business email"
                className="bg-white/10 border border-white/20 text-white rounded-2xl px-8 py-5 text-lg outline-none focus:border-[#FF5630] transition-all w-full placeholder:text-slate-500"
              />
              {error && (
                <span className="text-red-400 text-xs font-bold mt-2 ml-2 block animate-in fade-in duration-200">
                  {error}
                </span>
              )}
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#FF5630] text-white font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-[#FF5630]/20 whitespace-nowrap w-full sm:w-auto h-[68px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Get Updates"}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 max-w-md mx-auto leading-relaxed">
            No weekly spam. <br /> We only send updates when we discover recruiting tools, job boards, and hiring insights genuinely worth sharing.
          </p>
        </>
      ) : (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 border border-teal-500/20">
            ✓
          </div>
          <h3 className="text-3xl font-black text-white mb-4">
            You&apos;re subscribed.
          </h3>
          <p className="text-base text-slate-400 font-medium leading-relaxed mb-6">
            We’ll only reach out when we discover recruiting tools, job boards, and hiring insights genuinely worth sharing.
          </p>
          <span className="text-xs text-slate-500 font-bold block">
            No weekly spam. No marketing fluff.
          </span>
        </div>
      )}
    </div>
  );
}
