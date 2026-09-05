import Link from "next/link";
import { getAllCategories, getBoardsByCategory, getAllBoards } from "@/data/jobBoards";
import JobBoardCard from "@/components/JobBoardCard";

export const metadata = {
  title: "Browse Categories | JobBoardsReview",
  description:
    "Explore the comprehensive JobBoardsReview database, categorized by industry and specialism to find high-intent talent pools.",
};

// Map category slugs to icon colors for visual variety
const categoryColors = {
  technology: { bg: "bg-blue-50", text: "text-blue-600", hoverBg: "group-hover:bg-blue-600" },
  healthcare: { bg: "bg-[#FF5630]/10", text: "text-[#FF5630]", hoverBg: "group-hover:bg-[#FF5630]" },
  "remote-flexible": { bg: "bg-amber-50", text: "text-amber-600", hoverBg: "group-hover:bg-amber-600" },
  legal: { bg: "bg-teal-50", text: "text-teal-600", hoverBg: "group-hover:bg-teal-600" },
  education: { bg: "bg-purple-50", text: "text-purple-600", hoverBg: "group-hover:bg-purple-600" },
  logistics: { bg: "bg-emerald-50", text: "text-emerald-600", hoverBg: "group-hover:bg-emerald-600" },
  nonprofit: { bg: "bg-rose-50", text: "text-rose-600", hoverBg: "group-hover:bg-rose-600" },
  finance: { bg: "bg-sky-50", text: "text-sky-600", hoverBg: "group-hover:bg-sky-600" },
  startups: { bg: "bg-orange-50", text: "text-orange-600", hoverBg: "group-hover:bg-orange-600" },
  creative: { bg: "bg-fuchsia-50", text: "text-fuchsia-600", hoverBg: "group-hover:bg-fuchsia-600" },
  general: { bg: "bg-zinc-100", text: "text-zinc-700", hoverBg: "group-hover:bg-zinc-700" },
};

function getColors(slug) {
  return categoryColors[slug] || { bg: "bg-slate-100", text: "text-slate-600", hoverBg: "group-hover:bg-slate-600" };
}

// SVG icons for categories (no emojis)
function CategoryIcon({ slug, className }) {
  const icons = {
    technology: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    healthcare: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    "remote-flexible": <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    legal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
    education: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />,
  };
  const defaultIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />;

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[slug] || defaultIcon}
    </svg>
  );
}

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allBoards = getAllBoards();
  // Get first category's boards for the "trending" section
  const techBoards = getBoardsByCategory("technology").slice(0, 3);

  return (
    <>
      {/* Page Header — Centered, matches template */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 py-2.5 px-4 bg-amber-50 text-amber-700 text-sm font-bold tracking-wider uppercase rounded-full mb-6 border border-amber-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {categories.length} Specialized Categories
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight">
            Discover your <span className="scribble-underline text-[#FF5630]">perfect niche.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Explore the comprehensive JobBoardsReview database, categorized by industry and specialism to help you find high-intent talent pools.
          </p>
        </div>
      </section>

      {/* Category Grid — organic-radius cards with colored icon boxes */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => {
              const colors = getColors(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`bg-white p-10 rounded-[40px_15px_40px_15px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group ${i % 2 !== 0 ? "lg:mt-8" : ""}`}
                >
                  <div className={`w-16 h-16 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mb-6 ${colors.hoverBg} group-hover:text-white transition-all`}>
                    <CategoryIcon slug={cat.slug} className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1.5">{cat.name}</h3>
                  <p className="text-gray-500 font-medium uppercase tracking-widest text-[13px]">
                    <span className="font-bold text-gray-600">{cat.boardCount}</span> Board{cat.boardCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}

            {/* View All Card */}
            <Link
              href="/directory"
              className={`bg-white p-10 rounded-[40px_15px_40px_15px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group ${categories.length % 2 !== 0 ? "lg:mt-8" : ""}`}
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1.5">View All</h3>
              <p className="text-gray-500 font-medium uppercase tracking-widest text-[13px]"><span className="font-bold text-gray-600">{allBoards.length}+</span> Listings</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Niche Section */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Trending <span className="text-[#FF5630] italic">Niche Tech</span> Platforms
              </h2>
              <p className="text-lg text-slate-500 font-medium">Highly recommended for software engineering and data science hiring.</p>
            </div>
            <div className="relative">
              <Link
                href="/directory"
                className="text-slate-900 text-lg font-black underline decoration-[#FF5630] decoration-4 underline-offset-8 hover:text-[#FF5630] transition-colors"
              >
                Full Tech Directory
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techBoards.map((board) => (
              <JobBoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Suggestion CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block p-6 bg-teal-50 rounded-[40px_15px_40px_15px] mb-10">
            <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6">Can&apos;t find a specific niche?</h2>
          <p className="text-xl text-slate-500 mb-12 font-medium">
            We&apos;re constantly adding new specialized categories based on recruiter feedback. Let us know what you&apos;re looking for.
          </p>
          <Link
            href="/claim-listing"
            className="inline-flex items-center gap-4 bg-slate-900 text-white text-lg font-black px-12 py-5 rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-2xl hover:shadow-[#FF5630]/40"
          >
            Suggest a Category
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
