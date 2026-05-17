import Link from "next/link";
import { getAllBoards } from "@/data/jobBoards";
import JobBoardCard from "@/components/JobBoardCard";

export const metadata = {
  title: "JobBoardsReview | Compare & Review Job Boards",
  description:
    "Stop burning recruitment budget on blind intuition. Access the definitive database of job board performance, cost, and candidate quality.",
};

export default function HomePage() {
  const boards = getAllBoards();
  const featured = boards.slice(0, 6);

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative pt-24 pb-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-teal-50 text-teal-700 text-xs font-bold tracking-wider uppercase rounded-xl mb-6 border border-teal-100">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
              </svg>
              100% Verified Community Insights
            </div>
            <h1 className="text-6xl lg:text-[84px] font-black text-slate-900 leading-[0.75] tracking-tight mb-6 flex flex-col">
              <span>Hiring at</span>
              <span className="mt-[-16px] lg:mt-[-32px]"><span className="text-[#FF5630]">jobboardsreview.com</span>:</span>
              <span className="mt-[-16px] lg:mt-[-32px]"><span className="scribble-underline">better talent</span></span>
              <span className="mt-[-16px] lg:mt-[-32px]">without the</span>
              <span className="mt-[-16px] lg:mt-[-32px]">guesswork.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-xl font-medium">
              Stop burning recruitment budget on blind intuition. Access the definitive database of job board performance, cost, and candidate quality.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                href="/directory"
                className="btn-primary text-lg px-12 py-5 flex items-center gap-3"
              >
                Explore Boards
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" />
                </svg>
              </Link>
              <Link
                href="/compare"
                className="btn-outline text-lg px-12 py-5 flex items-center gap-3"
              >
                Compare Now
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative">
              {/* Floating organic backgrounds */}
              <div className="absolute -inset-10 bg-amber-100/30 rounded-[4rem] -rotate-6 -z-10"></div>
              <div className="absolute -inset-10 bg-teal-50/30 rounded-[4rem] rotate-3 -z-20"></div>

              {/* Testimonial Card */}
              <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-slate-100 relative z-20 max-w-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Verified Lead</div>
                    <div className="text-xl font-black">Sr. Recruiter @ Stripe</div>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed mb-6 font-medium">
                  &ldquo;JobBoardsReview saved us over $12k this quarter by steering us away from low-conversion tech boards. The applicant quality data is a goldmine.&rdquo;
                </p>
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract SVG Flourish */}
        <svg className="absolute top-1/4 right-0 opacity-10 pointer-events-none" width="400" height="400" viewBox="0 0 400 400" fill="none">
          <path d="M200 40C300 40 360 120 360 200C360 280 280 360 200 360C120 360 40 300 40 200C40 100 120 40 200 40Z" stroke="#FF5630" strokeWidth="4" strokeDasharray="12 12" />
        </svg>
      </section>

      {/* ─── Curved Transition ─── */}
      <div className="relative h-32 -mt-32">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 120C240 40 480 0 720 0C960 0 1200 40 1440 120V120H0V120Z" fill="#f8fafc" />
          <path d="M0 120C240 40 480 0 720 0C960 0 1200 40 1440 120" stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      </div>

      {/* ─── Featured Boards ─── */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-6">
            <div className="max-w-xl">
              <h2 className="text-5xl font-black text-slate-900 mb-6">
                Market leaders <br />
                <span className="font-light italic text-[#FF5630]">performing right now</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                We track live conversion data and recruiter sentiment to find the gems.
              </p>
            </div>
            <div className="relative">
              <Link
                href="/directory"
                className="text-slate-900 text-xl font-black underline decoration-slate-900 decoration-4 underline-offset-8 hover:text-[#FF5630] hover:decoration-[#FF5630] transition-colors"
              >
                Browse 500+ Boards
              </Link>
              {/* Hand-drawn arrow SVG */}
              <svg className="absolute -right-20 -top-8 text-[#FF5630] hidden lg:block" width="80" height="60" viewBox="0 0 80 60" fill="none">
                <path d="M10 50C30 40 50 10 70 20M70 20L60 10M70 20L55 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featured.map((board) => (
              <JobBoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Value Props Section ─── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl font-black text-slate-900 leading-tight mb-12">
                Designed for <br />
                <span className="italic font-light text-slate-400">The Data-Driven</span> <br />
                Hiring Professional.
              </h2>

              <div className="space-y-12">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    ),
                    title: "Proof of Intent",
                    desc: "We don't just ask for ratings; we track actual hire conversions shared by TA leaders. Verified and validated.",
                    colors: "bg-[#FF5630]/5 text-[#FF5630] group-hover:bg-[#FF5630] group-hover:text-white",
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    ),
                    title: "Market Sentiment",
                    desc: "Understand how the recruitment community views a board's customer service and reach in real-time.",
                    colors: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ),
                    title: "ROI Forecaster",
                    desc: "Input your budget and target roles to see predicted conversion data based on peer outcomes.",
                    colors: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-8 group">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-[22px] flex items-center justify-center transition-all ${item.colors}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-3 text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#F9F6F0] rounded-[60px] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF5630]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <svg className="w-16 h-16 text-[#FF5630]/20 mb-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391C0 7.905 3.748 4.039 9 3l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                  </svg>
                  <p className="text-3xl font-medium text-slate-700 leading-tight mb-12 italic">
                    &ldquo;JobBoardsReview is the only platform that treats job boards with the rigor they deserve. It&apos;s the destination for recruitment intelligence, built by TA pros for TA pros.&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div>
                      <div className="text-xl font-black">Marcus Thorne</div>
                      <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">VP Talent @ Hubspot</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[60px] p-16 md:p-24 relative overflow-hidden">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight">
                Stop guessing. <br /> <span className="text-[#FF5630]">Start hiring.</span>
              </h2>
              <p className="text-xl text-slate-400 mb-14 font-medium">
                Join 12,000+ recruiters who use JobBoardsReview to optimize their sourcing strategy daily.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <input
                  type="email"
                  placeholder="Your business email"
                  className="bg-white/10 border border-white/20 text-white rounded-2xl px-8 py-5 text-lg outline-none focus:border-[#FF5630] transition-all w-full sm:w-80 placeholder:text-slate-500"
                />
                <button className="bg-[#FF5630] text-white font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FF5630]/20 whitespace-nowrap">
                  Get Free Access
                </button>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF5630]/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/claim-listing" className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">
              Are you a job board owner? <span className="underline underline-offset-4">Claim your listing</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
