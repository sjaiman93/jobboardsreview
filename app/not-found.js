import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-6xl font-black text-white mb-4">404</h2>
      <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/directory" 
        className="bg-[#FF5630] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#FF5630]/20"
      >
        Browse Job Boards Directory
      </Link>
    </div>
  );
}
