import Link from "next/link";

// Opens the review flow (app/review/[slug]).
export default function WriteReviewButton({ boardSlug, className }) {
  return (
    <Link
      href={`/review/${boardSlug}`}
      className={className || "bg-[#FF5630] text-white font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-[#FF5630]/20 hover:scale-105 transition-all text-sm"}
    >
      ✍ Write a Review
    </Link>
  );
}
