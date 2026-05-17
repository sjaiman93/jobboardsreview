"use client";

import { useState } from "react";

export default function Collapsible({
  label = "View all",
  collapseLabel = "Show less",
  maxHeight = 120,
  fade = true,
  children,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className="relative overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: expanded ? "2000px" : `${maxHeight}px` }}
      >
        {children}

        {/* Gradient fade overlay */}
        {!expanded && fade && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-4 text-sm font-black text-[#FF5630] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
      >
        {expanded ? collapseLabel : label} {expanded ? "↑" : "↓"}
      </button>
    </div>
  );
}
