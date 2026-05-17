"use client";

import { useState, useRef, useEffect } from "react";

export default function BoardSelect({ boards, value, onChange, selectedSlugs }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = boards.find((b) => b.slug === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-[#FF5630]/40 focus:ring-2 focus:ring-[#FF5630]/10"
      >
        <span className="text-sm font-bold text-slate-900 truncate">
          {current ? current.name : "Select board..."}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 ml-2 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-50 max-h-[280px] overflow-y-auto animate-dropdown"
        >
          {boards.map((b) => {
            const isSelected = b.slug === value;
            const isUsed = selectedSlugs.includes(b.slug) && b.slug !== value;
            return (
              <button
                key={b.slug}
                type="button"
                disabled={isUsed}
                onClick={() => {
                  onChange(b.slug);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2
                  ${isSelected
                    ? "bg-orange-50 text-slate-900 font-bold"
                    : isUsed
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-50 font-medium"
                  }
                  first:rounded-t-xl last:rounded-b-xl
                `}
              >
                <span className="truncate">{b.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#FF5630] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isUsed && (
                  <span className="text-[10px] text-slate-300 font-medium shrink-0">In use</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
