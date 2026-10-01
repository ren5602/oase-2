"use client";

import { useEffect, useState } from "react";

export type SectionTheme = "light" | "dark" | "ink";

/**
 * The nav pill is fixed at `top: 12px` and is 44px tall, so its centre sits at
 * 34px. That is the line a section has to cross to take ownership of the nav.
 */
const PROBE = 34;

/**
 * Reports which section currently sits under the nav, so the nav can invert.
 *
 * Sections opt in by declaring `data-theme` — the nav never hardcodes a colour
 * and never needs to know a section's name. Adding a section later requires
 * only that attribute.
 *
 * Mechanics: an IntersectionObserver watches a band across the upper viewport.
 * The observer only fires when the *set* of sections in that band changes,
 * which happens exactly at section boundaries — precisely when the answer can
 * change. `getBoundingClientRect()` therefore runs a handful of times per page
 * rather than on every scroll tick.
 */
export function useSectionTheme(fallback: SectionTheme = "light"): SectionTheme {
  const [theme, setTheme] = useState<SectionTheme>(fallback);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme]"),
    );

    if (sections.length === 0) return;

    const active = new Set<HTMLElement>();

    const resolve = () => {
      // Nothing in the band means we are between sections or past the end.
      // Holding the previous value avoids a flicker back to the fallback.
      if (active.size === 0) return;

      const measured = Array.from(active).map((el) => ({
        el,
        top: el.getBoundingClientRect().top,
      }));

      // The winner is the section that most recently began above the probe.
      const passed = measured.filter((entry) => entry.top <= PROBE);

      const winner = passed.length
        ? // Latest of those that have crossed the line.
          passed.reduce((a, b) => (b.top > a.top ? b : a))
        : // None have crossed yet — use the nearest upcoming one.
          measured.reduce((a, b) => (b.top < a.top ? b : a));

      const next = (winner.el.dataset.theme as SectionTheme) ?? fallback;
      setTheme((prev) => (prev === next ? prev : next));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(el);
          else active.delete(el);
        }
        resolve();
      },
      {
        // Band runs from just below the probe down to ~34% of the viewport.
        rootMargin: `-${PROBE}px 0px -66% 0px`,
        threshold: 0,
      },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, [fallback]);

  return theme;
}
