"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const NAV_ITEMS = [
  { label: "Overview", id: "overview" },
  { label: "Pricing", id: "pricing" },
  { label: "Features", id: "features" },
  { label: "Reviews", id: "reviews" },
  { label: "FAQ", id: "faq" },
  { label: "Alternatives", id: "alternatives" },
];

export default function BoardStickyNav() {
  const [activeId, setActiveId] = useState("overview");
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);
  const navRef = useRef(null);
  const activePillRef = useRef(null);
  const itemRefs = useRef({});
  const isClickScrolling = useRef(false);

  // Sentinel IntersectionObserver for sticky detection
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Primary: Scroll spy handler
  const handleScroll = useCallback(() => {
    if (isClickScrolling.current) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    
    // Check if we are at the bottom of the page
    const isAtBottom = scrollY + windowHeight >= scrollHeight - 30;
    
    const ids = NAV_ITEMS.map((item) => item.id);
    const elements = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x) => x.el !== null);

    if (elements.length === 0) return;

    if (isAtBottom) {
      setActiveId(elements[elements.length - 1].id);
      return;
    }

    // Offset of Header (96px) + Sticky Nav (48px) + padding buffer = ~160px
    const threshold = 160;
    let activeSection = elements[0].id;

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].el.getBoundingClientRect();
      if (rect.top <= threshold + 10) {
        activeSection = elements[i].id;
      } else {
        break;
      }
    }

    setActiveId(activeSection);
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to establish correct initial active tab
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Animate the pill indicator to follow the active tab
  useEffect(() => {
    const activeEl = itemRefs.current[activeId];
    const pill = activePillRef.current;
    const nav = navRef.current;
    if (!activeEl || !pill || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();

    pill.style.width = `${elRect.width}px`;
    pill.style.transform = `translateX(${elRect.left - navRect.left + nav.scrollLeft}px)`;
  }, [activeId]);

  const handleClick = useCallback((e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const siteHeader = document.querySelector("header");
    const stickyNav = navRef.current;
    const headerH = siteHeader ? siteHeader.getBoundingClientRect().height : 96;
    const navH = stickyNav ? stickyNav.getBoundingClientRect().height : 48;
    const offset = headerH + navH + 24;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;

    // Suppress scroll handler during click-induced scroll animation
    isClickScrolling.current = true;
    setActiveId(id);

    window.scrollTo({
      top: targetPosition - offset,
      behavior: "smooth",
    });

    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }, []);

  return (
    <>
      {/* Sentinel element — when this scrolls out of view, the nav becomes sticky */}
      <div ref={sentinelRef} aria-hidden="true" className="h-0 w-full" />

      <nav
        ref={navRef}
        className={`board-sticky-nav ${isSticky ? "board-sticky-nav--stuck" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Animated pill background */}
          <div
            ref={activePillRef}
            className="board-sticky-nav__pill"
            aria-hidden="true"
          />

          <ul className="board-sticky-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  ref={(el) => (itemRefs.current[item.id] = el)}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`board-sticky-nav__link ${
                    activeId === item.id ? "board-sticky-nav__link--active" : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
