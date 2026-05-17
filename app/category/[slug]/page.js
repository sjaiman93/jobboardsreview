import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getBoardsByCategory, getAllCategories } from "@/data/jobBoards";
import JobBoardCard from "@/components/JobBoardCard";

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Job Boards | JobBoardsReview`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const boards = getBoardsByCategory(slug);

  return (
    <>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-[#FF5630] transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/categories" className="hover:text-[#FF5630] transition-colors">Categories</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">{category.name}</span>
        </nav>

        <div className="w-16 h-16 bg-[#FF5630]/10 text-[#FF5630] rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6">{category.name}</h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-2">
          {category.description}
        </p>
        <p className="text-[#FF5630] font-black text-lg">
          {boards.length} Board{boards.length !== 1 ? "s" : ""} listed
        </p>
      </div>

      {/* Board Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boards.map((board) => (
                <JobBoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[48px] border border-slate-100 card-shadow text-center">
              <p className="text-slate-500 font-medium mb-6">
                No boards listed in this category yet.
              </p>
              <Link
                href="/directory"
                className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-[#FF5630] transition-all inline-block"
              >
                Browse All Boards
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[60px] p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xl text-slate-400 font-medium mb-8">
                Highly recommended for {category.name.toLowerCase()} hiring.
              </p>
              <Link
                href="/directory"
                className="bg-[#FF5630] text-white font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FF5630]/20 inline-block"
              >
                Full {category.name} Directory
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF5630]/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
      </section>
    </>
  );
}
