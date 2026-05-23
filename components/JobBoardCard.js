import Link from "next/link";
import StarRating from "./StarRating";

export default function JobBoardCard({ board }) {
  return (
    <div className="bg-white p-5 sm:p-8 rounded-[48px] border border-slate-100 card-shadow hover:-translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="w-20 h-20 bg-slate-100 rounded-[28px] mb-8 flex items-center justify-center">
        <span className="text-3xl font-black text-slate-600">
          {board.name.charAt(0)}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 break-words">
        {board.name}
      </h3>

      {/* Description */}
      <p className="text-slate-500 font-medium mb-8 leading-relaxed line-clamp-4 overflow-hidden">
        {board.shortDescription}
      </p>

      {/* Rating */}
      <div className="mb-8">
        <StarRating rating={board.rating} reviewCount={board.reviewCount} />
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        <Link
          href={`/board/${board.slug}`}
          className="block w-full py-4 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-[#FF5630] transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
