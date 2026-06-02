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
  const [headerHeight, setHeaderHeight] = useState(96);
  const [navHeight, setNavHeight] = useState(48);

  const sentinelRef = useRef(null);
  const navRef = useRef(null);
  const activePillRef = useRef(null);
  const itemRefs = useRef({});
  const isClickScrolling = useRef(false);

  // Dynamically observe header and nav heights to handle responsive layout changes and mobile menu expansion
  useEffect(() => {
    const siteHeader = document.querySelector("header");
    const stickyNav = navRef.current;

    const updateHeights = () => {
      if (siteHeader) {
        setHeaderHeight(siteHeader.getBoundingClientRect().height);
      }
      if (stickyNav) {
        setNavHeight(stickyNav.getBoundingClientRect().height);
      }
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);

    let headerObserver;
    if (siteHeader && typeof ResizeObserver !== "undefined") {
      headerObserver = new ResizeObserver(() => {
        updateHeights();
      });
      headerObserver.observe(siteHeader);
    }

    let navObserver;
    if (stickyNav && typeof ResizeObserver !== "undefined") {
      navObserver = new ResizeObserver(() => {
        updateHeights();
      });
      navObserver.observe(stickyNav);
    }

    return () => {
      window.removeEventListener("resize", updateHeights);
      if (headerObserver) headerObserver.disconnect();
      if (navObserver) navObserver.disconnect();
    };
  }, []);

  // Sentinel IntersectionObserver for sticky detection, synced with dynamic header height
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: `-${headerHeight}px 0px 0px 0px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [headerHeight]);

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

    const threshold = headerHeight + navHeight + 30; // Matches dynamic landing limit with subpixel tolerance
    let activeSection = elements[0].id;

    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].el.getBoundingClientRect();
      if (rect.top <= threshold) {
        activeSection = elements[i].id;
      } else {
        break;
      }
    }

    setActiveId(activeSection);
  }, [headerHeight, navHeight]);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount or height changes to establish correct initial active tab
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

    const offset = headerHeight + navHeight + 24;
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
  }, [headerHeight, navHeight]);

  return (
    <>
      {/* Sentinel element — when this scrolls out of view, the nav becomes sticky */}
      <div ref={sentinelRef} aria-hidden="true" className="h-0 w-full" />

      <nav
        ref={navRef}
        className={`board-sticky-nav ${isSticky ? "board-sticky-nav--stuck" : ""}`}
        style={isSticky ? { top: `${headerHeight}px` } : {}}
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
