"use client";

import { useState, useEffect } from "react";

export default function RotatingInsightCard() {
  const messages = [
    "The right job board can completely change your hiring outcomes while reducing sourcing costs.",
    "Not every recruiting channel fits every hiring workflow. What works for one team may fail for another.",
    "The best recruiting teams compare channels before committing budget.",
    "Better hiring decisions start with better recruiting intelligence."
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setFade(true);
      }, 300); // match fade out duration
    }, 3000); // each card remains visible for 3 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-slate-100 relative z-20 max-w-sm hover:scale-[1.015] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Market Intel</div>
          <div className="text-xl font-black">JBR Insight</div>
        </div>
      </div>
      <div className="min-h-[96px] flex items-start">
        <p className={`text-slate-600 italic leading-relaxed mb-6 font-medium transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>
          &ldquo;{messages[index]}&rdquo;
        </p>
      </div>
      <div className="flex text-amber-400 gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
