"use client";

import { useEffect, useRef } from "react";

import { SITE } from "@/data/site";

/**
 * Fullscreen navigation, opened by the fixed pill.
 *
 * The overlay is always dark regardless of which section is beneath it: it is
 * a deliberate full-bleed surface, not a themed section, so it does not
 * declare `data-theme`.
 *
 * It carries no close button of its own. The pill that opened it stays above
 * (`z-130` vs `z-120`) and morphs into a cross, so a single control opens and
 * closes. That keeps the reference's lone-piece-of-chrome idea intact.
 *
 * Entrance is `clip-path: inset(0 0 100% 0)` -> `inset(0 0 0 0)`, dropping the
 * panel from the top — the same edge the trigger sits on.
 */

type NavOverlayProps = {
  open: boolean;
  onClose: () => void;
};

/** Shared entrance for the three footer blocks. */
function footerMotion(open: boolean, delay: number) {
  return {
    transitionProperty: "opacity, transform",
    transitionDuration: "600ms",
    transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: open ? `${delay}ms` : "0ms",
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0)" : "translateY(0.75rem)",
  } as const;
}

export default function NavOverlay({ open, onClose }: NavOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Trap Tab inside the nav while it is open.
     The wordmark and the close pill live in `<header>`, outside this panel in
     the DOM but visually on top of it. Querying `[data-nav-focus]` across the
     document picks up both groups in DOM order — wordmark, pill, then the
     links — which is the order a keyboard user expects to traverse them.
     Trapping to the panel alone would strand the user with no way to close. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-focus]"),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      id="oase-nav-overlay"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      /* Keeps the links out of the tab order while closed without unmounting,
         which would restart the entrance animation on every open. */
      inert={!open}
      className={[
        "fixed inset-0 z-[120] bg-coffee-dark text-cream",
        "transition-[opacity,clip-path] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        open
          ? "pointer-events-auto opacity-100 [clip-path:inset(0_0_0%_0)]"
          : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]",
      ].join(" ")}
    >
      {/* `pt-28` clears the fixed pill. */}
      <div className="shell flex h-full flex-col pt-28 pb-10">
        <nav aria-label="Primary" className="flex flex-1 items-center">
          <ul className="w-full">
            {SITE.nav.map((link, index) => (
              <li key={link.id} className="overflow-hidden">
                <a
                  href={`#${link.id}`}
                  onClick={onClose}
                  data-nav-focus
                  className="link-slide group display flex items-baseline gap-5 py-1 text-[clamp(2.5rem,5.2vw,4.75rem)]"
                  /* Staggered entrance. Delay is zeroed on exit so the panel
                     clears immediately instead of waiting out the cascade. */
                  style={{
                    transitionDelay: open ? `${140 + index * 55}ms` : "0ms",
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(0.5em)",
                  }}
                >
                  <span className="label w-10 shrink-0 text-amber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Closing row: the primary CTA, then the practical details. */}
        <div className="grid grid-cols-12 items-end gap-10 border-t border-cream/15 pt-8">
          <div
            className="col-span-5 flex flex-col items-start gap-5"
            style={footerMotion(open, 420)}
          >
            {/* The reference's chamfer, reused as the button shape so the
                button and the pill read as one system. */}
            <a
              href="#visit"
              onClick={onClose}
              data-nav-focus
              className="press group relative inline-flex h-14 items-center justify-center px-9"
            >
              <svg
                viewBox="0 0 200 56"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M 200 4 C 200 1.791 198.209 0 196 0 L 4 0 C 1.791 0 0 1.791 0 4 L 0 37 L 11.216 54.186 C 11.955 55.318 13.215 56 14.566 56 L 200 56 Z"
                  className="fill-amber transition-colors duration-300 group-hover:fill-cream"
                />
              </svg>
              <span className="display relative text-sm text-ink">
                Visit OASE
              </span>
            </a>

            <p className="serif text-lg text-cream">{SITE.tagline}</p>
          </div>

          <div className="col-span-4 text-sm text-cream/70" style={footerMotion(open, 480)}>
            <address className="not-italic">
              {SITE.visit.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="mt-4">
              {SITE.visit.hours[0].days} · {SITE.visit.hours[0].time}
            </p>
          </div>

          <div
            className="col-span-3 flex flex-col items-end gap-2 text-sm"
            style={footerMotion(open, 540)}
          >
            <a
              href={SITE.visit.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              data-nav-focus
              className="underline decoration-cream/30 underline-offset-4 transition-colors duration-300 hover:decoration-cream"
            >
              {SITE.visit.instagram.handle}
            </a>
            <a
              href={`mailto:${SITE.visit.email}`}
              data-nav-focus
              className="underline decoration-cream/30 underline-offset-4 transition-colors duration-300 hover:decoration-cream"
            >
              {SITE.visit.email}
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-cream/40">{SITE.statement}</p>
      </div>
    </div>
  );
}
