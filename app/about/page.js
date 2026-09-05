"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "How do you verify reviews?",
    a: "Every reviewer must connect their LinkedIn profile. We cross-reference their company, title, and tenure with known users of the job boards they review. We also require proof of ad spend before allowing detailed performance reviews. Anonymous reviews are heavily vetted and require corroborating documentation.",
  },
  {
    q: "Can job boards influence rankings?",
    a: "Absolutely not. We offer clearly labeled sponsorship slots, but organic rankings and community ratings are 100% data-driven and cannot be purchased, influenced, or manipulated. Our ranking algorithm is strictly based on verified recruiter performance metrics.",
  },
  {
    q: "Who is this platform for?",
    a: "JobBoardsReview is built for staffing companies, in-house recruiters, and talent acquisition leaders who spend real budgets on job boards and need transparent, peer-verified data to make smarter sourcing decisions. If you spend money on job boards, this is for you.",
  },
  {
    q: "How is this different from G2 or Capterra?",
    a: "G2 and Capterra review software products broadly. JobBoardsReview is hyper-focused on the US job board ecosystem — we track recruiter-specific metrics like cost per hire, applicant quality, and conversion rates that generalist review platforms simply don't capture. We're built by recruiters, for recruiters.",
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
              Our Mission
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] mb-10">
              <span className="text-[#FF5630]">Democratizing</span> <br />
              access <br />
              to transparent job board intelligence.
            </h1>
            <p className="text-xl lg:text-2xl text-slate-500 leading-relaxed max-w-2xl font-medium">
              We exist to give staffing companies and recruiters the verified, unbiased data they need to make smarter sourcing decisions across <span className="scribble-underline">US job boards</span> — without the noise.
            </p>
          </div>
        </div>
      </section>

      {/* ─── TRUTH CARD + NO PAID PLACEMENT ─── */}
      <section className="pb-40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="bg-white p-12 rounded-[40px_15px_40px_15px] shadow-2xl border border-slate-100 relative z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl">
              <h2 className="text-3xl font-black mb-6">The Truth, Verified.</h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium">
                Every review on JobBoardsReview is verified against LinkedIn profiles and proof of ad spend. We don&apos;t allow anonymous sniping or fake praise. We track actual hire conversions shared by Talent Acquisition leaders to validate the claims job boards make.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[#FF5630] font-black text-4xl">100%</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Independence</span>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-teal-600 font-black text-4xl">No</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Paid Placement</span>
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
              No Paid Placement. <br />
              <span className="italic font-light text-slate-400">Just hard data.</span>
            </h3>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
              Unlike traditional directory sites, JobBoardsReview does not accept fees to boost rankings. Our proprietary algorithm is strictly based on community-verified performance metrics. When we say a board works, it&apos;s because the data says so.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 py-3 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-slate-700">100% Unbiased Methodology</span>
              </div>
              <div className="flex items-center gap-3 py-3 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <svg className="w-5 h-5 text-[#FF5630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-slate-700">Community-Verified Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIGILANTE BUILDER SECTION ─── */}
      <section className="py-32 bg-slate-900 text-white rounded-[80px] mx-4 sm:mx-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left — Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 py-2 px-4 bg-white/10 text-[#FF5630] text-xs font-bold tracking-wider uppercase rounded-xl mb-8 border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                The Builders
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight">
                Built by recruiters. <br />
                <span className="italic font-light text-slate-400">Not corporations.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
                JobBoardsReview was created by a team of talent acquisition professionals who were frustrated with the opacity of the job board market. After years of wasting budget on underperforming platforms, they decided to build the intelligence layer the industry needed.
              </p>
              <div className="space-y-5 mb-12">
                {[
                  "No venture capital. No board of directors. No bias.",
                  "Every insight comes from real recruiter spend data.",
                  "Rankings cannot be bought, only earned.",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#FF5630] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300 font-medium">{point}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-6">
                {["Anonymous", "Independent", "Data-first"].map((tag) => (
                  <span key={tag} className="px-5 py-2.5 border border-white/15 rounded-full text-sm font-bold text-white/70 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-[40px_15px_40px_15px] overflow-hidden border-4 border-white/10 bg-slate-800">
                  <img
                    src="/images/vigilante-builder.png"
                    alt="Anonymous builder — independent and data-first"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Glow accent */}
                <div className="absolute -inset-8 bg-[#FF5630]/10 rounded-full blur-[60px] -z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract decorations */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF5630]/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px]"></div>
      </section>

      {/* ─── MISSION SECTION (replaces pricing) ─── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              Why <span className="text-[#FF5630]">JobBoardsReview</span> exists.
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              We&apos;re not a SaaS product. We&apos;re not monetized through rankings. We&apos;re a community-driven intelligence layer built for the people who actually spend money on job boards.
            </p>
          </div>

          {/* Mission Card */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-white p-10 sm:p-14 rounded-[40px_15px_40px_15px] border border-slate-100 card-shadow">
              <h3 className="text-3xl font-black text-slate-900 mb-6">
                No pay-to-play. No bias. Just data.
              </h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                We don&apos;t charge job boards for visibility. We don&apos;t sell rankings. Everything on this platform is driven by verified recruiter insights — real performance data from real campaigns, shared by the talent professionals who ran them.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    title: "100% Independent",
                    desc: "No outside investment. No conflicted incentives. Pure transparency.",
                  },
                  {
                    icon: (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ),
                    title: "Verified Reviews",
                    desc: "Every review backed by LinkedIn verification and proof of spend.",
                  },
                  {
                    icon: (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ),
                    title: "Built for Staffing",
                    desc: "Designed by TA teams who spend real budgets on real boards.",
                  },
                ].map((item) => (
                  <div key={item.title} className="text-center p-6 bg-slate-50 rounded-[28px]">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#FF5630] mx-auto mb-4 shadow-sm border border-slate-100">
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/join"
              className="inline-flex items-center gap-3 bg-slate-900 text-white text-lg font-black px-12 py-5 rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-2xl hover:shadow-[#FF5630]/40"
            >
              Join the Community
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
