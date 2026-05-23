"use client";

import Link from "next/link";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  pricingOptions,
  selectedPricing,
  onPricingChange,
  isMobile,
}) {
  return (
    <aside className={isMobile ? "space-y-10" : "space-y-10"}>
      {/* Industry Focus */}
      <div>
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
          Industry Focus
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
            <input
              type="checkbox"
              checked={selectedCategory === "all"}
              onChange={() => onCategoryChange("all")}
              className="w-5 h-5 rounded-lg border-2 border-slate-200 text-[#FF5630] focus:ring-[#FF5630] transition-all cursor-pointer"
            />
            <span className="font-bold text-slate-700 group-hover:text-[#FF5630]">
              All Industries
            </span>
          </label>
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
              <input
                type="checkbox"
                checked={selectedCategory === cat.slug}
                onChange={() => onCategoryChange(cat.slug)}
                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-[#FF5630] focus:ring-[#FF5630] transition-all cursor-pointer"
              />
              <span className="font-bold text-slate-700 group-hover:text-[#FF5630]">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing Filter */}
      <div>
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
          Pricing Model
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onPricingChange("all")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all min-h-[44px] ${
              selectedPricing === "all"
                ? "bg-[#FF5630] text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#FF5630]"
            }`}
          >
            All
          </button>
          {pricingOptions.map((option) => (
            <button
              key={option}
              onClick={() => onPricingChange(option)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm capitalize transition-all min-h-[44px] ${
                selectedPricing === option
                  ? "bg-[#FF5630] text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-[#FF5630]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar CTA — hide in mobile drawer */}
      {!isMobile && (
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <svg className="w-8 h-8 text-amber-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <h5 className="text-xl font-black mb-3">List Your Board</h5>
            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
              Get your job board in front of thousands of hiring managers on JobBoardsReview.
            </p>
            <Link
              href="/claim-listing"
              className="block text-center w-full py-3 bg-[#FF5630] rounded-xl font-black text-sm hover:scale-105 transition-all text-white"
            >
              List Your Board
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF5630]/10 rounded-full blur-2xl"></div>
        </div>
      )}
    </aside>
  );
}
