"use client";

import { useState, useMemo } from "react";
import { getAllBoards, getAllCategories } from "@/data/jobBoards";
import JobBoardCard from "@/components/JobBoardCard";
import CategoryFilter from "@/components/CategoryFilter";
import CustomSelect from "@/components/CustomSelect";

export default function DirectoryPage() {
  const boards = getAllBoards();
  const categories = getAllCategories();
  const pricingOptions = ["free", "paid", "quote-based"];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPricing, setSelectedPricing] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Most Relevant");

  const sortOptions = ["Most Relevant", "Community Rating", "Newest Added"];

  const filtered = useMemo(() => {
    const list = boards.filter((b) => {
      const matchCat = selectedCategory === "all" || b.categorySlug === selectedCategory;
      const matchPrice = selectedPricing === "all" || b.pricingModel === selectedPricing;
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchPrice && matchSearch;
    });

    if (sortBy === "Community Rating") {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === "Newest Added") {
      return [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    return list;
  }, [boards, selectedCategory, selectedPricing, searchQuery, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) + (selectedPricing !== "all" ? 1 : 0);

  return (
    <>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
        <header className="mb-10 sm:mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                <a href="/" className="hover:text-[#FF5630] transition-colors">Home</a>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-900">Directory</span>
              </nav>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-4 sm:mb-6">
                Explore <span className="scribble-underline">50+ Job Boards</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed">
                Filter by industry, pricing, and community rating to find the perfect platform for your next hire on JobBoardsReview.
              </p>
            </div>

            {/* Search Bar — stacked on mobile */}
            <div className="relative flex-shrink-0 w-full lg:w-auto">
              <div className="bg-white rounded-[24px] border border-slate-200 p-2 flex flex-col sm:flex-row items-stretch sm:items-center shadow-lg gap-2 sm:gap-0">
                <div className="flex items-center pl-4 pr-2 py-2 sm:py-0">
                  <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search job boards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none py-2 px-2 w-full sm:w-64 text-slate-900 font-medium"
                  />
                </div>
                <button className="bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#FF5630] transition-all min-h-[44px]">
                  Search
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-700 shadow-sm hover:border-[#FF5630] transition-all min-h-[44px] w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#FF5630] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Drawer (Slide-over) */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#FCFBF8] shadow-2xl flex flex-col animate-slide-in-right">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-black text-slate-900">Filters</h3>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  pricingOptions={pricingOptions}
                  selectedPricing={selectedPricing}
                  onPricingChange={setSelectedPricing}
                  isMobile
                />
              </div>
              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-[#FF5630] transition-all min-h-[44px]"
                >
                  Show {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPricing("all");
                  }}
                  className="w-full py-3 text-slate-400 font-bold text-center hover:text-slate-900 transition-colors min-h-[44px]"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Sidebar — hidden on mobile, sticky on desktop */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-[100px] lg:self-start">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              pricingOptions={pricingOptions}
              selectedPricing={selectedPricing}
              onPricingChange={setSelectedPricing}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-9 space-y-8 sm:space-y-12">
            {/* Sorting & Stats — stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 sm:pb-6 gap-3 sm:gap-4">
              <div className="text-slate-500 font-bold">
                Showing <span className="text-slate-900 font-black">{filtered.length}</span> job board{filtered.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest shrink-0">Sort by:</span>
                <CustomSelect
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Sort by..."
                  className="w-48"
                  triggerClassName="!bg-transparent !border-none !px-2 !py-2 !text-slate-900 !font-bold"
                />
              </div>
            </div>

            {/* Cards Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filtered.map((board) => (
                  <JobBoardCard key={board.id} board={board} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[48px] border border-slate-100 card-shadow p-8 sm:p-12 text-center">
                <p className="text-slate-500 font-medium">No boards match your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPricing("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#FF5630] transition-all text-sm min-h-[44px]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
