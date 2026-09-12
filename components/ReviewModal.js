"use client";
import React from "react";

export default function ReviewModal({ isOpen, onClose, boardName }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
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
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all text-sm"
          >
            Submit Review
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
