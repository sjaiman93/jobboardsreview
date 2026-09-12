import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-slate-100 p-6 rounded-3xl mb-8">
        <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h2 className="text-7xl font-black text-slate-900 mb-4 tracking-tight">404</h2>
      <h3 className="text-3xl font-bold text-slate-800 mb-4">This page ghosted you.</h3>
      
      <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
        Just like that perfect candidate, the page you&apos;re looking for is nowhere to be found. Let&apos;s get you back to your pipeline.
      </p>
      
      <Link 
        href="/directory" 
        className="bg-[#FF5630] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-[#FF5630]/20 transition-all duration-300"
      >
        Browse Job Boards Directory
      </Link>
    </div>
  );
}
