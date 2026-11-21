import Link from "next/link";

export const metadata = {
  title: "Page not found | JobBoardsReview",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/category/healthcare", label: "Healthcare job boards", primary: true },
  { href: "/directory", label: "All job boards" },
  { href: "/compare", label: "Compare boards" },
  { href: "/blog", label: "Blog" },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="bg-slate-100 p-6 rounded-3xl mb-8" aria-hidden="true">
        <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <p className="text-7xl font-black text-slate-900 mb-4 tracking-tight">404</p>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">This page ghosted you.</h1>

      <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
        Just like that perfect candidate, the page you&apos;re looking for is nowhere to be found. Let&apos;s get you back to your pipeline.
      </p>

      <nav aria-label="Popular pages" className="flex flex-wrap justify-center gap-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              l.primary
                ? "bg-[#FF5630] text-white font-bold px-7 py-4 rounded-xl hover:opacity-90 transition-opacity"
                : "font-bold px-7 py-4 rounded-xl border-2 border-slate-200 text-slate-800 hover:border-slate-400 transition-colors"
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
