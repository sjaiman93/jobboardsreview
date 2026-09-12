"use client";

import { useState, useEffect, useCallback } from "react";
import ReviewModal from "./ReviewModal";

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

      <ReviewModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        boardName={boardName} 
      />
    </>
  );
}
