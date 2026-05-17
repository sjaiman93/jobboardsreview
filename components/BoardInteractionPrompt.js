"use client";

import { useState, useEffect, useCallback } from "react";

export default function BoardInteractionPrompt({ boardName }) {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  // Track which option the user selected (internal only, no UI change)
  const [selectionType, setSelectionType] = useState(null);

  // Show after 20-25% scroll, hide near footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      setVisible(scrollPercent >= 22);

      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        setNearFooter(footerTop <= window.innerHeight + 20);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenReview = useCallback((type) => {
    setSelectionType(type);
    setShowModal(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const shouldShow = visible && !nearFooter;

  return (
    <>
      {/* ─── Fixed Prompt Bar ─── */}
      <div
        className={`interaction-prompt ${shouldShow ? "interaction-prompt--visible" : ""}`}
        role="complementary"
        aria-label="User engagement prompt"
      >
        <div className="interaction-prompt__inner">
          {/* Question */}
          <div className="interaction-prompt__question">
            <svg className="w-5 h-5 text-[#FF5630] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-black text-slate-900">
              Have you used {boardName}?
            </span>
          </div>

          {/* Actions — all 3 open the same review flow */}
          <div className="interaction-prompt__actions">
            <button
              onClick={() => handleOpenReview("used")}
              className="interaction-prompt__btn interaction-prompt__btn--primary"
            >
              ✍ Yes, I've used it
            </button>
            <button
              onClick={() => handleOpenReview("currently_using")}
              className="interaction-prompt__btn interaction-prompt__btn--secondary"
            >
              Currently Using
            </button>
            <button
              onClick={() => handleOpenReview("considering")}
              className="interaction-prompt__btn interaction-prompt__btn--secondary"
            >
              Considering
            </button>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="interaction-prompt__close"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Review Modal ─── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-[32px] p-10 max-w-lg w-full mx-4 card-shadow animate-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              Write a Review for {boardName}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Share your experience to help others make better hiring decisions.
            </p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Your Rating
                </label>
                <div className="flex gap-1 text-2xl text-slate-300">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="cursor-pointer hover:text-amber-400 transition-colors">★</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Review Title
                </label>
                <input
                  type="text"
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
                  placeholder="What did you like or dislike?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF5630]/10 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all text-sm">
                Submit Review
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
