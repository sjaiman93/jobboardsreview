import Link from "next/link";

export const metadata = {
  title: "Advertise with JobBoardsReview | Reach Healthcare Staffing Recruiters",
  description:
    "Put your job board or recruiting tool in front of US healthcare staffing teams. Sponsored placements are always labelled and never change ratings.",
  alternates: { canonical: "/advertise" },
};

const CONTACT = "contact@jobboardsreview.com";

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 lg:py-32">
      <p className="text-sm font-black uppercase tracking-widest text-[#FF5630] mb-4">Advertise</p>
      <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
        Yes, we&apos;re open for advertising.
      </h1>
      <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
        JobBoardsReview is where US healthcare staffing recruiters check job boards and AI recruiting tools before they
        spend. If that&apos;s who you want to reach, let&apos;s talk.
      </p>

      <h2 className="text-2xl font-black text-slate-900 mb-4">What you can sponsor</h2>
      <ul className="space-y-3 text-lg text-slate-600 font-medium mb-10 list-disc pl-6">
        <li>A featured slot on a category page</li>
        <li>A mention in our newsletter</li>
        <li>Something else you have in mind: ask us</li>
      </ul>

      <h2 className="text-2xl font-black text-slate-900 mb-4">The rules we don&apos;t bend</h2>
      <ul className="space-y-3 text-lg text-slate-600 font-medium mb-10 list-disc pl-6">
        <li>Every sponsored placement is labelled &ldquo;Sponsored&rdquo;.</li>
        <li>Paying never changes a rating, the order of reviews, or what we say about a product.</li>
        <li>We don&apos;t remove honest reviews for advertisers.</li>
      </ul>

      <div className="flex flex-wrap gap-4">
        <a
          href={`mailto:${CONTACT}?subject=${encodeURIComponent("Advertising on JobBoardsReview")}`}
          className="bg-[#FF5630] text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity"
        >
          Email {CONTACT}
        </a>
        <Link href="/claim-listing" className="font-black px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-800 hover:border-slate-400">
          Claim your free listing
        </Link>
      </div>
    </div>
  );
}
