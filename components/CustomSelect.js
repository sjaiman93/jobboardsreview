"use client";

import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ options, value, onChange, placeholder = "Select option...", className = "", triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Normalize options to support both string array and object array [{ value, label }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const current = normalizedOptions.find((opt) => opt.value === value);

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

  // Close on Escape key
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
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-sm font-bold text-slate-900 ${triggerClassName}`}
      >
        <span className="truncate">
          {current ? current.label : placeholder}
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
          className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-[280px] overflow-y-auto animate-dropdown"
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2
                  ${isSelected
                    ? "bg-slate-50 text-slate-900 font-bold"
                    : "text-slate-700 hover:bg-slate-50/80 font-medium"
                  }
                  first:rounded-t-xl last:rounded-b-xl
                `}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#FF5630] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
