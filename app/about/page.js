"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "How are reviews verified?",
    a: "Reviewers connect their LinkedIn profile for identity verification. Company, title, and tenure are cross-referenced with known users of the job boards they review. Detailed performance reviews require proof of ad spend. Anonymous submissions are vetted and require corroborating documentation.",
  },
  {
    q: "How are rankings determined?",
    a: "Rankings are based on verified recruiter performance data — including cost per hire, applicant quality, and conversion rates. Sponsored and featured listings are always clearly labeled and separated from organic rankings.",
  },
  {
    q: "Who is this platform for?",
    a: "JobBoardsReview is for staffing companies, in-house recruiters, and talent acquisition leaders who spend real budgets on job boards and need transparent, peer-verified data to make smarter sourcing decisions.",
  },
  {
    q: "How is this different from G2 or Capterra?",
    a: "G2 and Capterra review software products broadly. JobBoardsReview is hyper-focused on the US job board ecosystem — tracking recruiter-specific metrics like cost per hire, applicant quality, and conversion rates that generalist review platforms don't capture.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-amber-50 text-amber-700 text-xs font-bold tracking-wider uppercase rounded-xl mb-10 border border-amber-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              About
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] mb-10">
              Transparent <br />
              <span className="text-[#FF5630]">job board</span> <br />
              intelligence.
            </h1>
            <p className="text-xl lg:text-2xl text-slate-500 leading-relaxed max-w-2xl font-medium">
              JobBoardsReview helps staffing companies and recruiters make smarter sourcing decisions with verified data across <span className="scribble-underline">US job boards</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE DO ─── */}
      <section className="pb-40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="bg-white p-12 rounded-[40px_15px_40px_15px] shadow-2xl border border-slate-100 relative z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl">
              <h2 className="text-3xl font-black mb-6">Verified Reviews. Real Data.</h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium">
                Every review on JobBoardsReview is verified against LinkedIn profiles and proof of ad spend. We track actual hire conversions shared by Talent Acquisition leaders to validate the claims job boards make.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[#FF5630] font-black text-4xl">85+</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Job Boards</span>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-teal-600 font-black text-4xl">11</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Categories</span>
                </div>
              </div>
            </div>
            {/* Hand-drawn arrow */}
            <svg className="absolute -left-12 -bottom-16 text-[#FF5630] hidden lg:block" width="120" height="100" viewBox="0 0 120 100" fill="none">
              <path d="M20 20C40 60 80 80 100 40M100 40L90 30M100 40L85 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <h3 className="text-4xl font-black mb-8 leading-tight">
              Compare. Review. <br />
              <span className="italic font-light text-slate-400">Decide with confidence.</span>
            </h3>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
              Stop guessing which job boards deliver results. Browse detailed profiles, compare pricing side-by-side, and read verified reviews from recruiters who have actually used these platforms.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 py-3 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-slate-700">Verified Reviews</span>
              </div>
              <div className="flex items-center gap-3 py-3 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <svg className="w-5 h-5 text-[#FF5630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-bold text-slate-700">Side-by-Side Comparison</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              What you get.
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Everything you need to evaluate job boards before spending your recruitment budget.
            </p>
          </div>

          {/* Features */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  title: "Detailed Profiles",
                  desc: "Pricing, features, audience reach, and recruiter ratings for every job board.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: "Compare Tool",
                  desc: "Put up to 4 job boards side-by-side to compare pricing, reach, and quality.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Budget Optimizer",
                  desc: "Calculate expected applicants and optimal budget distribution across boards.",
                },
              ].map((item) => (
                <div key={item.title} className="text-center p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#FF5630] mx-auto mb-4 border border-slate-100">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/directory"
              className="inline-flex items-center gap-3 bg-slate-900 text-white text-lg font-black px-12 py-5 rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-2xl hover:shadow-[#FF5630]/40"
            >
              Explore the Directory
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ─── */}
      <section className="py-32 bg-[#F9F6F0]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left cursor-pointer"
                  >
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 pr-4">{faq.q}</h4>
                    <svg
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                      <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
