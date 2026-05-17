"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllBoards } from "@/data/jobBoards";

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const boards = getAllBoards();
  const roundedCount = Math.floor(boards.length / 10) * 10;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="flex-1 flex items-center justify-center py-20 px-6 relative overflow-hidden min-h-[calc(100vh-96px)]">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF5630]/5 rounded-full blur-[100px] -mr-40 -mt-20 animate-[float_20s_infinite_alternate_ease-in-out]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px] -ml-20 -mb-20 animate-[float_20s_infinite_alternate_ease-in-out]" style={{ animationDelay: "-5s" }}></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center relative z-10">
        {/* Left Side: Value Proposition */}
        <div className="lg:col-span-6 space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-amber-50 text-amber-700 text-xs font-bold tracking-wider uppercase rounded-xl border border-amber-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Unlock Premium Insights
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
              Choose the Right <span className="text-[#FF5630]">Job Board</span> Before You Spend
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Compare {roundedCount}+ US job boards using real recruiter reviews, pricing insights, and performance data — before you commit your hiring budget.
            </p>
          </div>

          {/* Benefit Points */}
          <div className="space-y-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                color: "text-[#FF5630]",
                title: "Verified Reviews",
                desc: `Full access to ${roundedCount}+ job board reviews and ratings`,
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                color: "text-teal-600",
                title: "Pricing & ROI",
                desc: "Real pricing and ROI data shared by recruiters",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                color: "text-amber-600",
                title: "Deep Analysis",
                desc: "Detailed pros/cons analysis for each board",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center ${item.color} border border-slate-100`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Trust removed for cleaner layout */}
        </div>

        {/* Right Side: The Form Card */}
        <div className="lg:col-span-6 relative">

          {!submitted ? (
            <div className="bg-white p-10 lg:p-14 rounded-[56px] card-shadow border border-slate-100">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Join JobBoardsReview</h2>
                <p className="text-slate-500 font-medium">Free forever for recruiters. No credit card required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label htmlFor="email" className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF5630] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" id="email" required placeholder="name@company.com" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-lg font-medium" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label htmlFor="company_name" className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF5630] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <input type="text" id="company_name" required placeholder="Acme Recruitment" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-lg font-medium" />
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-[24px] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-2xl hover:shadow-[#FF5630]/30 flex items-center justify-center gap-3 active:scale-[0.98]">
                  Get Free Access
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-5">
                <p className="text-base text-slate-400 font-medium">Or continue with</p>
                <div className="flex gap-4 w-full">
                  <button className="flex-1 py-5 px-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button className="flex-1 py-5 px-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-50 transition-colors">
                    <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </button>
                </div>
                <p className="text-slate-400 text-base font-medium">
                  Already have an account?{" "}
                  <a href="#" className="text-slate-900 font-semibold hover:text-[#FF5630]">Log in</a>
                </p>
              </div>
            </div>
          ) : (
            /* Success/Confirmation State */
            <div className="bg-white p-10 lg:p-14 rounded-[56px] card-shadow border border-slate-100 text-center">
              <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-10">
                🎉
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">You&apos;re on the list!</h2>
              <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed">
                We&apos;ve sent a verification link to your email. Check your inbox to unlock full access to{" "}
                <span className="text-slate-900 font-black">JobBoardsReview.com</span>.
              </p>

              <div className="bg-slate-50 p-8 rounded-[32px] text-left space-y-4 mb-10">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">What&apos;s next?</h4>
                {["Verify your business email", "Personalize your industry niche filters", "Start comparing real ROI data"].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                    <p className="text-slate-600 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <Link href="/directory" className="w-full py-5 bg-[#FF5630] text-white font-black text-lg rounded-[24px] flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  Go to Directory
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
                <button onClick={() => setSubmitted(false)} className="text-slate-400 font-bold hover:text-slate-900">
                  Didn&apos;t get the email? Resend
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
