"use client";

import { useState } from "react";

export default function StarRating({
  rating = null,
  reviewCount = null,
  readOnly = false,
  onChange = null,
  className = "",
}) {
  const [hoveredRating, setHoveredRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);

  const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  // Check if we should render interactive mode
  const isInteractive = !readOnly && rating === null;

  const handleSelect = (val) => {
    setSelectedRating(val);
    if (onChange) {
      onChange(val);
    }
  };

  if (isInteractive) {
    const activeValue = hoveredRating ?? selectedRating ?? 0;

    return (
      <div 
        className={`flex items-center gap-1.5 ${className}`}
        onMouseLeave={() => setHoveredRating(null)}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const isFilled = i <= activeValue;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setHoveredRating(i)}
              onFocus={() => setHoveredRating(i)}
              onBlur={() => setHoveredRating(null)}
              className="p-1 rounded-full text-slate-300 hover:text-[#FF5630] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5630] transition-all duration-200 transform hover:scale-125 active:scale-95 cursor-pointer"
              aria-label={`Rate ${i} out of 5 stars`}
            >
              <svg
                className={`w-6 h-6 transition-all duration-300 ${
                  isFilled ? "text-[#FF5630] scale-110" : "text-slate-300"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isFilled ? "0" : "2"}
                fill={isFilled ? "currentColor" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={starPath} />
              </svg>
            </button>
          );
        })}
        {selectedRating !== null && (
          <span className="text-xs font-bold text-slate-400 ml-2 animate-fade-in">
            (You rated: {selectedRating}/5)
          </span>
        )}
      </div>
    );
  }

  // Rating Present State (Static Display)
  const displayRating = rating ?? 0;
  const showStats = rating !== null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stars Container */}
      <div className="flex items-center gap-0.5 text-[#FF5630]">
        {[1, 2, 3, 4, 5].map((i) => {
          // Determine fill percentage for fractional star
          const diff = displayRating - (i - 1);
          let fillPercent = 0;
          if (diff >= 1) {
            fillPercent = 100;
          } else if (diff > 0) {
            fillPercent = diff * 100;
          }

          return (
            <div key={i} className="relative w-5 h-5">
              {/* Background Empty Star */}
              <svg 
                className="absolute top-0 left-0 w-full h-full text-slate-200" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d={starPath} />
              </svg>

              {/* Foreground Filled Star */}
              {fillPercent > 0 && (
                <div 
                  className="absolute top-0 left-0 h-full overflow-hidden text-[#FF5630]" 
                  style={{ width: `${fillPercent}%` }}
                >
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d={starPath} />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric and review count stats */}
      {showStats && (
        <span className="font-black text-slate-900 text-sm">
          {displayRating.toFixed(1)}
          {reviewCount !== null && (
            <span className="text-slate-400 font-bold ml-1.5">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
