import Link from "next/link";

// Placeholder until there is real trend data: kept out of search results.
export const metadata = {
  title: "Trends | JobBoardsReview",
  description: "Recruiting trends from real recruiter reviews. Coming soon.",
  alternates: { canonical: "/trends" },
  robots: { index: false, follow: true },
};

export default function TrendsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 lg:py-32">
      <p className="text-sm font-black uppercase tracking-widest text-[#FF5630] mb-4">Trends</p>
      <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
        So much is trending in recruiting, we&apos;re catching it one trend at a time.
      </h1>
      <div className="space-y-5 text-lg text-slate-600 font-medium leading-relaxed">
        <p>
          New boards, price changes, AI tools that promise the world. We&apos;d rather show you what recruiters actually
          report than guess.
        </p>
        <p>
          This page will fill up as reviews come in. Until then, the best way to help it along is to review a board
          you&apos;ve used.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/category/healthcare" className="bg-[#FF5630] text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity">
          Review a healthcare board
        </Link>
        <Link href="/blog" className="font-black px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-800 hover:border-slate-400">
          Read the blog
        </Link>
      </div>
    </div>
  );
}
