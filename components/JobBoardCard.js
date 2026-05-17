import Link from "next/link";

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
      {board.rating && (
        <div className="flex items-center gap-3 mb-8">
          <div className="flex text-[#FF5630]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-black text-slate-900">{board.rating}</span>
        </div>
      )}

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
