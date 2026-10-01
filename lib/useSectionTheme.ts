"use client";

import { useEffect, useState } from "react";

import { pageZoom } from "@/lib/viewport";

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
 *
 * ---------------------------------------------------------------------------
 * THE PROBE IS IN DEVICE PX, AND HAS TO BE CONVERTED
 *
 * Both inputs to the comparison above are in DIFFERENT units once the page is
 * magnified (see the PAGE ZOOM block in `globals.css`):
 *
 *   PROBE              a CSS length in the fixed header -> LAYOUT px
 *   rect.top           getBoundingClientRect()          -> DEVICE px
 *   rootMargin         IntersectionObserver             -> DEVICE px
 *
 * At 1920 the zoom is 1.25, so the pill's centre is at device y=42.5 while
 * PROBE still says 34 — the band would sit 8.5px above the pill and the theme
 * would flip early on every boundary. Verified: an unscaled probe reports the
 * next section as the owner while its top is still 42px down, i.e. while the
 * previous section is still the one under the pill.
 *
 * So the probe is scaled UP into device px to meet the rect, rather than the
 * rect being scaled down — `rootMargin` cannot be expressed in layout px at
 * all, so device px is the only unit both inputs can share.
 */
export function useSectionTheme(fallback: SectionTheme = "light"): SectionTheme {
  const [theme, setTheme] = useState<SectionTheme>(fallback);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme]"),
    );

    if (sections.length === 0) return;

    const active = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    const resolve = () => {
      // Nothing in the band means we are between sections or past the end.
      // Holding the previous value avoids a flicker back to the fallback.
      if (active.size === 0) return;

      const probe = PROBE * pageZoom();

      const measured = Array.from(active).map((el) => ({
        el,
        top: el.getBoundingClientRect().top,
      }));

      // The winner is the section that most recently began above the probe.
      const passed = measured.filter((entry) => entry.top <= probe);

      const winner = passed.length
        ? // Latest of those that have crossed the line.
          passed.reduce((a, b) => (b.top > a.top ? b : a))
        : // None have crossed yet — use the nearest upcoming one.
          measured.reduce((a, b) => (b.top < a.top ? b : a));

      const next = (winner.el.dataset.theme as SectionTheme) ?? fallback;
      setTheme((prev) => (prev === next ? prev : next));
    };

    /* The band and the probe both depend on the zoom, and the zoom depends on
       the viewport width — so a resize that crosses a zoom step has to rebuild
       the observer rather than merely re-run `resolve()`. Without this the
       rootMargin would keep the previous step's inset and the boundary would
       drift by the difference.

       Guarded on the probe value rather than rebuilding on every resize event:
       `resize` fires continuously while a window is dragged, and the observer
       only needs replacing when the zoom step actually changes. */
    let lastProbe = -1;

    const build = () => {
      const probe = PROBE * pageZoom();
      if (probe === lastProbe) return;
      lastProbe = probe;

      observer?.disconnect();
      active.clear();

      observer = new IntersectionObserver(
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
          rootMargin: `-${probe}px 0px -66% 0px`,
          threshold: 0,
        },
      );

      for (const section of sections) observer.observe(section);
    };

    build();
    window.addEventListener("resize", build);

    return () => {
      window.removeEventListener("resize", build);
      observer?.disconnect();
    };
  }, [fallback]);

  return theme;
}
