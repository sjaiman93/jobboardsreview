"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { searchBoards } from "@/data/jobBoards";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isJoinPage = pathname === "/join";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        setSearchResults(searchBoards(searchQuery));
        setIsDropdownOpen(true);
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/categories", label: "Categories" },
    { href: "/compare", label: "Compare Tool" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FCFBF8] border-b border-slate-100">
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 bg-[#FF5630] rounded-[14px] rotate-3 flex items-center justify-center text-white text-sm font-black transition-all group-hover:rotate-0 group-hover:scale-105">
              JBR
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              JobBoardsReview
            </span>
          </Link>

          {/* Desktop Links */}
          {!isJoinPage && (
            <div className="hidden md:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[15px] font-medium text-slate-500 hover:text-[#FF5630] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {!isJoinPage && (
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-5 py-2.5 w-72 focus-within:ring-4 focus-within:ring-[#FF5630]/10 transition-all">
                <svg className="w-5 h-5 text-slate-400 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Find your niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery) setIsDropdownOpen(true); }}
                  className="bg-transparent text-sm w-full outline-none placeholder:text-slate-400 text-slate-900"
                />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && searchQuery && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto py-2">
                      {searchResults.map((board) => (
                        <Link
                          key={board.slug}
                          href={`/board/${board.slug}`}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className="block px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="text-sm font-bold text-slate-900 mb-0.5">{board.name}</div>
                          <div className="text-xs text-slate-500 truncate">{board.shortDescription}</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-sm text-slate-500 text-center">
                      No matching job boards found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              href="/join"
              className="hidden sm:inline-flex bg-slate-900 text-white text-[15px] font-bold px-7 py-3.5 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-xl hover:shadow-[#FF5630]/20 active:scale-95"
            >
              Join the Community
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-slate-500 hover:text-slate-900 p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && !isJoinPage && (
        <div className="md:hidden pb-4 animate-fade-in border-t border-slate-100">
          <div className="flex flex-col gap-1 pt-2 px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-slate-700 font-medium hover:text-[#FF5630] transition-colors py-3 px-3 rounded-xl hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="bg-slate-900 text-white font-bold text-sm text-center py-3 rounded-2xl mt-2 hover:bg-[#FF5630] transition-all"
            >
              Join the Community
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
