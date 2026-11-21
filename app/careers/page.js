import Link from "next/link";

// Placeholder until there are real openings: kept out of search results.
export const metadata = {
  title: "Careers | JobBoardsReview",
  description: "We just launched. No openings yet, but we're always open to working together.",
  alternates: { canonical: "/careers" },
  robots: { index: false, follow: true },
};

const CONTACT = "contact@jobboardsreview.com";

export default function CareersPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 lg:py-32">
      <p className="text-sm font-black uppercase tracking-widest text-[#FF5630] mb-4">Careers</p>
      <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
        A job board review site with no job openings. We see the irony.
      </h1>
      <div className="space-y-5 text-lg text-slate-600 font-medium leading-relaxed">
        <p>
          We&apos;ve only just launched, so it&apos;s a little early for us to be hiring. When we do, you can bet we&apos;ll
          check the reviews before picking where to post.
        </p>
        <p>
          What we are always open to is working together: recruiters with stories worth sharing, writers who know
          staffing, and anyone building something useful for hiring teams.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={`mailto:${CONTACT}?subject=${encodeURIComponent("Let's collaborate")}`}
          className="bg-[#FF5630] text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity"
        >
          Say hello: {CONTACT}
        </a>
        <Link href="/directory" className="font-black px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-800 hover:border-slate-400">
          Browse job boards
        </Link>
      </div>
    </div>
  );
}
