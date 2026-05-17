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

  // Intersection Observer for sticky detection
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

  // Helper: find the single closest section to the activation zone
  const findActiveSection = useCallback(() => {
    const ids = NAV_ITEMS.map((item) => item.id);
    // Activation point = 120px from top (header + nav region)
    const activationY = 120;
    let closest = null;
    let closestDist = Infinity;

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - activationY);
      if (rect.top <= activationY + 200 && dist < closestDist) {
        closestDist = dist;
        closest = id;
      }
    }
    return closest;
  }, []);

  // Primary: IntersectionObserver scroll spy
  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    // Track which sections are currently intersecting
    const visibleSections = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        // Pick the first visible section in document order (ensures only ONE is active)
        if (visibleSections.size > 0) {
          for (const id of ids) {
            if (visibleSections.has(id)) {
              setActiveId(id);
              break;
            }
          }
        }
      },
      {
        rootMargin: "-120px 0px -65% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Fallback: scroll event listener for edge cases IO might miss
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isClickScrolling.current || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const active = findActiveSection();
        if (active) {
          setActiveId(active);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [findActiveSection]);

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

    // Dynamically measure offset from actual DOM elements
    const siteHeader = document.querySelector("header");
    const stickyNav = navRef.current;
    const headerH = siteHeader ? siteHeader.getBoundingClientRect().height : 96;
    const navH = stickyNav ? stickyNav.getBoundingClientRect().height : 48;
    const offset = headerH + navH + 24;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;

    // Suppress observer updates during programmatic scroll
    isClickScrolling.current = true;
    setActiveId(id);

    window.scrollTo({
      top: targetPosition - offset,
      behavior: "smooth",
    });

    // Re-enable observer after scroll completes
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
