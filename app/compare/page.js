"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllBoards } from "@/data/jobBoards";
import BoardSelect from "@/components/BoardSelect";
import StarRating from "@/components/StarRating";

const boardColors = [
  { bg: "bg-teal-50", border: "border-teal-100", bar: "bg-teal-500" },
  { bg: "bg-amber-50", border: "border-amber-100", bar: "bg-amber-500" },
  { bg: "bg-indigo-50", border: "border-indigo-100", bar: "bg-indigo-500" },
  { bg: "bg-rose-50", border: "border-rose-100", bar: "bg-rose-500" },
];

function qualityData(rating) {
  if (rating == null) return { pct: "0%", label: "N/A", color: "bg-slate-200" };
  if (rating >= 4.7) return { pct: "90%", label: "Elite", color: "bg-teal-500" };
  if (rating >= 4.4) return { pct: "75%", label: "Strong", color: "bg-teal-500" };
  if (rating >= 4.0) return { pct: "60%", label: "Good", color: "bg-amber-500" };
  return { pct: "45%", label: "Variable", color: "bg-amber-500" };
}

function costEstimate(model) {
  if (model === "free") return "$0 (Free)";
  if (model === "freemium") return "$50 – $300";
  return "$200 – $600";
}

export default function ComparePage() {
  const allBoards = getAllBoards();

  const [selectedSlugs, setSelectedSlugs] = useState([
    "hired",
    "getwork",
    "remote-co",
  ]);
  const [showFullTable, setShowFullTable] = useState(false);

  const selected = selectedSlugs
    .map((s) => allBoards.find((b) => b.slug === s))
    .filter(Boolean);

  function removeSlot(index) {
    if (selectedSlugs.length > 2) {
      setSelectedSlugs((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addSlot() {
    if (selectedSlugs.length < 4) {
      const unused = allBoards.find((b) => !selectedSlugs.includes(b.slug));
      if (unused) setSelectedSlugs((prev) => [...prev, unused.slug]);
    }
  }

  function handleChange(index, newSlug) {
    setSelectedSlugs((prev) => {
      const copy = [...prev];
      copy[index] = newSlug;
      return copy;
    });
  }

  const fullCompareRows = [
    { label: "Best For", key: "bestFor" },
    { label: "Category", key: "category" },
    { label: "Pricing", key: "pricing" },
    { label: "Rating", key: "rating" },
    { label: "Reviews", key: "reviewCount" },
    { label: "Founded", key: "yearFounded" },
    { label: "Headquarters", key: "headquarters" },
  ];

  return (
    <>
      {/* Hero Header */}
      <section className="pt-12 sm:pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8 relative">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-amber-50 text-amber-700 text-xs font-bold tracking-wider uppercase rounded-xl mb-6 border border-amber-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Decision Intelligence
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] mb-6">
              Compare with <br /> <span className="scribble-underline text-[#FF5630]">total clarity</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Side-by-side performance metrics verified by thousands of recruiters. Choose the platform that actually scales your team.
            </p>
          </div>

          {/* Decorative flourish */}
          <svg className="absolute -top-10 right-1/4 opacity-10 pointer-events-none hidden lg:block" width="300" height="300" viewBox="0 0 400 400" fill="none">
            <path d="M200 40C300 40 360 120 360 200C360 280 280 360 200 360C120 360 40 300 40 200C40 100 120 40 200 40Z" stroke="#FF5630" strokeWidth="2" strokeDasharray="8 8" />
          </svg>
        </div>
      </section>

      {/* ─── Card-Based Board Selector ─── */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 items-stretch">
            {selected.map((board, i) => {
              const color = boardColors[i % boardColors.length];
              return (
                <div
                  key={board.slug}
                  className={`${color.bg} ${color.border} border rounded-[28px] p-5 flex items-center gap-4 relative group flex-1 min-w-[220px]`}
                >
                  {/* Logo */}
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-slate-600 shadow-sm shrink-0">
                    {board.name.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Custom dropdown selector */}
                    <BoardSelect
                      boards={allBoards}
                      value={board.slug}
                      onChange={(newSlug) => handleChange(i, newSlug)}
                      selectedSlugs={selectedSlugs}
                    />
                    <p className="text-xs text-slate-500 font-medium truncate mt-1">{board.bestFor}</p>
                  </div>
                  {/* Remove button */}
                  {selectedSlugs.length > 2 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Board Card */}
            {selectedSlugs.length < 4 && (
              <button
                onClick={addSlot}
                className="border-2 border-dashed border-slate-200 rounded-[28px] px-8 py-5 flex items-center justify-center gap-2 hover:border-[#FF5630]/40 hover:bg-[#FF5630]/5 transition-all min-w-[180px] flex-1"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-bold text-slate-500">Add Board</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── Simplified Quick Comparison Table ─── */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-separate border-spacing-0 min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-6 text-left min-w-[200px] border-b border-slate-200">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Comparison Matrix</span>
                  </th>
                  {selected.map((board, i) => {
                    const color = boardColors[i % boardColors.length];
                    return (
                      <th key={board.slug} className="p-6 min-w-[260px] bg-white border-b border-slate-200 text-left relative overflow-hidden first:rounded-tl-[32px] last:rounded-tr-[32px]">
                        <div className={`absolute top-0 left-0 w-full h-1 ${color.bar}`}></div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-600">
                            {board.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900">{board.name}</h3>
                            <StarRating rating={board.rating} reviewCount={board.reviewCount} />
                          </div>
                        </div>
                        <Link href={`/board/${board.slug}`} className="text-sm font-black text-[#FF5630] hover:underline underline-offset-4">
                          Full Profile →
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white shadow-xl rounded-b-[32px]">
                {/* Pricing Structure */}
                <tr>
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Pricing Structure</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6 border-b border-slate-100 font-medium text-slate-600">{b.pricing}</td>
                  ))}
                </tr>

                {/* Key Features */}
                <tr className="bg-[rgba(255,86,48,0.02)]">
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Key Features</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6 border-b border-slate-100">
                      <ul className="space-y-2">
                        {b.highlights.map((h, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Target Industry */}
                <tr>
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Target Industry</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6 border-b border-slate-100 text-sm font-medium text-slate-600">{b.category}</td>
                  ))}
                </tr>

                {/* Applicant Quality — visual bars */}
                <tr className="bg-[rgba(255,86,48,0.02)]">
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Applicant Quality</td>
                  {selected.map((b) => {
                    const q = qualityData(b.rating);
                    return (
                      <td key={b.slug} className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${q.color} rounded-full`} style={{ width: q.pct }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-700 whitespace-nowrap">{q.label}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Avg Cost Per Hire */}
                <tr>
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Avg. Cost Per Hire</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6 border-b border-slate-100 font-black text-slate-900">{costEstimate(b.pricingModel)}</td>
                  ))}
                </tr>

                {/* Pros / Cons */}
                <tr className="bg-[rgba(255,86,48,0.02)]">
                  <td className="p-6 border-b border-slate-100 font-black text-slate-900">Pros / Cons</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6 border-b border-slate-100">
                      <div className="space-y-3">
                        <div className="p-3 bg-teal-50 rounded-xl text-xs font-medium text-teal-800 border border-teal-100">
                          {b.highlights[0]}
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl text-xs font-medium text-red-800 border border-red-100">
                          {b.pricingModel === "paid" ? "Paid access only" : b.pricingModel === "freemium" ? "Premium features gated" : "Limited employer tools"}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Final Decision Actions */}
                <tr>
                  <td className="p-6 font-black text-slate-900">Final Decision</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="p-6">
                      <Link
                        href={`/board/${b.slug}`}
                        className="block w-full py-4 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-[#FF5630] transition-all"
                      >
                        Choose {b.name}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Full Comparison Toggle ─── */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setShowFullTable(!showFullTable)}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-[#FF5630] hover:text-[#FF5630] transition-all card-shadow"
          >
            <svg className={`w-5 h-5 transition-transform ${showFullTable ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showFullTable ? "Hide Full Comparison" : "View Full Comparison"}
          </button>

          {showFullTable && (
            <div className="mt-10 overflow-x-auto pb-4">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left p-4 w-40">
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Details</span>
                    </th>
                    {selected.map((board) => (
                      <th key={board.slug} className="p-4 text-center">
                        <span className="font-black text-slate-900 text-lg">{board.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fullCompareRows.map((row, ri) => (
                    <tr key={row.label} className={`border-t border-slate-100 ${ri % 2 === 0 ? "bg-[rgba(248,250,252,0.5)]" : ""}`}>
                      <td className="p-4 text-sm text-slate-400 font-black uppercase tracking-wider">
                        {row.label}
                      </td>
                      {selected.map((board) => (
                        <td key={board.slug} className="p-4 text-center text-sm text-slate-700 font-medium">
                          {row.key === "rating" ? (
                            <div className="flex justify-center">
                              <StarRating rating={board.rating} reviewCount={board.reviewCount} />
                            </div>
                          ) : row.key === "reviewCount" ? (
                            board.reviewCount == null ? "-" : board.reviewCount
                          ) : (
                            board[row.key]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Highlights Row */}
                  <tr className="border-t border-slate-100">
                    <td className="p-4 text-sm text-slate-400 font-black uppercase tracking-wider align-top">
                      Key Strengths
                    </td>
                    {selected.map((board) => (
                      <td key={board.slug} className="p-4 text-center">
                        <ul className="space-y-2">
                          {board.highlights.map((h, i) => (
                            <li key={i} className="flex items-center justify-center gap-2 text-sm text-slate-700 font-medium">
                              <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[40px_15px_40px_15px] py-20 px-8 sm:px-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <svg className="w-16 h-16 text-[#FF5630] mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Still not sure which <br className="hidden sm:block" /> platform is right for you?
              </h2>
              <p className="text-lg sm:text-xl text-slate-400 mb-12 font-medium max-w-2xl mx-auto">
                Download our recruitment marketing playbook or talk to an advisor.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button className="bg-[#FF5630] text-white font-black px-12 py-5 rounded-3xl hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FF5630]/20">
                  Get Expert Advice
                </button>
                <button className="bg-white/10 border border-white/20 text-white font-black px-12 py-5 rounded-3xl hover:bg-white/20 transition-all duration-300">
                  Download Playbook
                </button>
              </div>
            </div>
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF5630]/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </section>
    </>
  );
}
