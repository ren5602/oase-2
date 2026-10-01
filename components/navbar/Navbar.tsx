"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import NavOverlay from "@/components/navbar/NavOverlay";
import { SITE } from "@/data/site";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { useSectionTheme } from "@/lib/useSectionTheme";

/**
 * The reference's ONLY fixed chrome is a decorative 80x44 pill at
 * `top:12px; right:12px` — a `<div>` with no links, no click handler and no
 * aria. Its shape comes from an inline SVG whose path is reproduced verbatim
 * below, so the geometry is exact: 4px radius top-left/top-right, a square
 * bottom-right, and a chamfered bottom-left.
 *
 * This build makes that pill functional. It is the menu trigger, and the
 * wordmark, the five links and the CTA live in the overlay it opens.
 *
 * The pill sits ABOVE the overlay and morphs its three bars into a close
 * cross, so one control opens and closes rather than two swapping places.
 *
 * Colour is never hardcoded here. `useSectionTheme` reports which section is
 * under the pill, and the pill inverts to stay legible against it.
 */

const PILL_PATH =
  "M 80 4 C 80 1.791 78.209 0 76 0 L 4 0 C 1.791 0 0 1.791 0 4 " +
  "L 0 25 L 11.216 42.186 C 11.955 43.318 13.215 44 14.566 44 L 80 44 Z";

/* Bar geometry, verbatim from the reference: 24 x 5.72, fully rounded.
   Centres are y + h/2 -> 12.86, 22, 31.14. */
const BAR_H = 5.72;
const BARS = [
  { y: 10, centerY: 12.86, openY: 9.14 },
  { y: 19.14, centerY: 22, openY: 0 },
  { y: 28.28, centerY: 31.14, openY: -9.14 },
];

export default function Navbar() {
  const theme = useSectionTheme("dark");
  /* While the overlay is open it is always dark, so the pill must render its
     dark-section treatment regardless of the section underneath. */
  const [open, setOpen] = useState(false);
  const isLight = !open && theme === "light";

  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger so keyboard users are not dropped at the
    // top of the document.
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    lockScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
    };
  }, [open, close]);

  return (
    <>
      {/* A full-width fixed frame. `pointer-events-none` so the empty space
          between the wordmark and the pill never intercepts clicks meant for
          the page beneath it; only the two real controls opt back in.

          The wordmark and the pill share this bar so they stay on one optical
          line, and both sit above the overlay (`z-130` vs `z-120`) — which is
          what lets the overlay keep the brand mark visible while it is open. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[130]">
        <div className="shell flex items-start justify-between pt-3">
          <a
            href="#home"
            /* Marks this as part of the nav's focus order, so the overlay's
               Tab trap traverses wordmark -> pill -> links. */
            data-nav-focus
            className={[
              "quiet-hover pointer-events-auto display mt-3 text-[0.7rem]",
              "tracking-[0.34em]",
              isLight ? "text-ink" : "text-cream",
            ].join(" ")}
          >
            {SITE.name}
          </a>

          <button
            ref={triggerRef}
            type="button"
            data-nav-focus
            onClick={() => (open ? close() : setOpen(true))}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls="oase-nav-overlay"
            className="press pointer-events-auto relative block h-11 w-20 cursor-pointer"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

            <svg
              viewBox="0 0 80 44"
              className="h-full w-full"
              aria-hidden="true"
              focusable="false"
            >
              {/* The pill body. On a dark section it is the reference's light
                  grey; on a light section it inverts to ink so it stays
                  visible. */}
              <path
                d={PILL_PATH}
                className={[
                  "transition-colors duration-500",
                  isLight ? "fill-ink" : "fill-[#dddddd]",
                ].join(" ")}
              />

              {/* The three bars. Always the inverse of the pill.

                  `transform-box: view-box` is what lets `transform-origin` be
                  expressed in the viewBox's own units; without it the origin
                  resolves against the element's bounding box and the bars
                  rotate around the wrong point. */}
              <g
                className={[
                  "transition-colors duration-500",
                  isLight ? "fill-cream" : "fill-ink",
                ].join(" ")}
              >
                {BARS.map((bar, index) => (
                  <rect
                    key={bar.y}
                    x="28"
                    y={bar.y}
                    width="24"
                    height={BAR_H}
                    rx={BAR_H / 2}
                    style={{
                      transformBox: "view-box",
                      transformOrigin: `40px ${bar.centerY}px`,
                      transform: open
                        ? `translateY(${bar.openY}px) rotate(${
                            index === 0 ? 45 : index === 2 ? -45 : 0
                          }deg)`
                        : "none",
                      opacity: open && index === 1 ? 0 : 1,
                      transition: `transform 420ms var(--ease-out-soft), opacity 200ms var(--ease-out-soft)`,
                    }}
                  />
                ))}
              </g>
            </svg>
          </button>
        </div>
      </header>

      <NavOverlay open={open} onClose={close} />
    </>
  );
}
