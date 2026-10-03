"use client";

import Image from "next/image";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ChamferButton from "@/components/ui/ChamferButton";
import { CTA, CTA_CARDS } from "@/data/cta";
import { SITE } from "@/data/site";
import { EASE } from "@/lib/animations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * CTA — the closing panel.
 *
 * NOT in the reference. Original work in the language Hero, Signature and Menu
 * established; the layout follows the design reference, the type and the button
 * follow this page. What was kept and what was changed is itemised in
 * `data/cta.ts`.
 *
 * ---------------------------------------------------------------------------
 * `id="visit"`, AND WHY THAT MATTERS
 *
 * The nav overlay has carried a "Visit OASE" button pointing at `#visit` since
 * the nav was built, and nothing in the document has ever had that id — so it
 * went nowhere. This section is where that anchor finally lands.
 *
 * That is the same dangling-link situation `#gallery` was in before the Gallery
 * was built, and it is settled the same way: the section takes the id the nav
 * already promised. The Footer in step 9 takes `id="footer"`, so this anchor
 * stays stable.
 *
 * ---------------------------------------------------------------------------
 * `data-theme="light"`, WHICH CLOSES THE PAGE
 *
 * The page runs coffee (hero) -> cream -> cream -> ink (experience) -> cream
 * (bean to cup) -> ink (gallery) -> cream. The two ink sections are separated,
 * and the closing ground is the light one, so the nav pill inverts back to ink
 * and the page ends the way it began.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS SECTION OWNS NO SCROLL MECHANISM EITHER
 *
 * Signature pins a five-phase choreography, Menu is a fan carousel, Experience
 * a sticky horizontal strip, Bean to Cup a wheel, and the Gallery deliberately
 * flows. That is five different answers already, and the closing panel is the
 * one place on the page that should ask for nothing. It fades in and stops.
 */
export default function Cta() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* A plain, overlapping fade-up — not `SplitText`.
           The per-character reveal is Signature's signature moment, and running
           it again here would spend it twice: the effect only reads as special
           while it is the one heading that does it. */
        const tl = gsap.timeline({
          defaults: { ease: EASE.out },
          scrollTrigger: {
            trigger: scope.current,
            /* 70% rather than `top bottom`: the section should be properly in
               frame before it animates, not assembling itself off the edge. */
            start: "top 70%",
            /* One-shot, like every other reveal on the page. Re-running on
               scroll-back reads as a glitch rather than an entrance. */
            once: true,
          },
        });

        /* Order is the reading order, and each step overlaps the last so the
           group arrives as one gesture rather than five. */
        tl.from("[data-cta-heading]", { y: 24, duration: 0.8 })
          .from("[data-cta-body]", { y: 20, duration: 0.8 }, "-=0.62")
          .from("[data-cta-actions]", { y: 16, duration: 0.8 }, "-=0.62")
          /* The cards come last and from slightly further down, with a touch of
             scale — they are the heaviest objects in the composition, so they
             should feel like they settle rather than slide. */
          .from(
            "[data-cta-card='back']",
            { y: 32, scale: 0.97, duration: 1, transformOrigin: "50% 100%" },
            "-=0.7",
          )
          .from(
            "[data-cta-card='front']",
            { y: 24, scale: 0.94, duration: 1, transformOrigin: "50% 100%" },
            "-=0.85",
          );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      /* Under reduced motion nothing is constructed, so the markup renders in
         its final state — `from` tweens animate FROM an explicit state and
         leave no inline styles when they never run.

         The `clearProps` below exists for the case where the preference CHANGES
         while the page is open: `matchMedia` reverts the timeline, and reverting
         a `from` tween restores its start values rather than removing them. The
         Gallery hit the same trap and recorded it — a leftover inline
         `transform` beats every stylesheet rule, so the cards would be stuck
         mid-animation for the life of the page. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            "[data-cta-heading]",
            "[data-cta-body]",
            "[data-cta-actions]",
            "[data-cta-card]",
          ],
          { clearProps: "all" },
        );
      });

      return () => mm.revert();
    },
    { scope },
  );

  const [back, front] = CTA_CARDS;

  return (
    <section
      ref={scope}
      id="visit"
      data-theme="light"
      aria-labelledby="cta-heading"
      className="themed cta-ground relative py-[var(--spacing-section)]"
    >
      {/* `shell` for the gutter, then `.cta-grid` for the centred pair. */}
      <div className="shell">
        <div className="cta-grid">
          {/* ------------------------------------------------------- the text */}
          <div>
            <h2
              id="cta-heading"
              data-cta-heading
              className="display text-section text-ink/70"
            >
              {CTA.heading}
            </h2>

            <p
              data-cta-body
              className="mt-6 max-w-[34ch] text-[var(--section-muted)]"
            >
              {CTA.body}
            </p>

            <div data-cta-actions className="cta-actions mt-10">
              {/* INK PLATE, not the accent — and the reference agrees.

                  The reference's own button is a dark plate with light type,
                  and this page already has that convention: the Menu's selected
                  tab is `bg-ink text-cream`. Two reasons it beats an amber
                  plate here rather than merely matching:

                    1. CONTRAST. Cream on ink measures 16.91:1. The palette's
                       light-ground accent, `--color-amber-deep`, measures
                       4.56:1 — passing, but the primary action on the page
                       should not be the weakest text on it.
                    2. IT ANCHORS THE COLUMN. The text side of this composition
                       is entirely soft — 70% ink heading, muted body — so a dark
                       plate gives the eye the one hard edge it needs, which is
                       exactly the job the reference's black button does.

                  Hover goes to the accent: amber plate, ink label, 8.4:1. That
                  is the same warm flash the Hero's words use, so the two ends
                  of the page share an idiom. */}
              <ChamferButton
                href={SITE.visit.maps}
                external={CTA.primary.external}
                plateClassName="fill-ink group-hover:fill-amber"
                labelClassName="text-cream transition-colors duration-300 group-hover:text-ink"
              >
                {CTA.primary.label}
              </ChamferButton>

              <a href={CTA.secondary.href} className="cta-link">
                {CTA.secondary.label}
                <span className="cta-link__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>
          </div>

          {/* ---------------------------------------------------- the two cards
              `figure` rather than a `div`, and both carry real alt text. These
              are photographs of the café, so they get described rather than
              hidden — the pair is decorative as a COMPOSITION, but neither
              image is decoration. */}
          <div className="cta-cluster">
            <figure data-cta-card="back" className="cta-card cta-card--back">
              <Image
                src={back.image}
                alt={back.alt}
                fill
                /* The cluster caps at 544 layout px, so the back card is at
                   most 78% of that — 424px. At the 1.25 zoom ceiling that is
                   530 DEVICE px, which is the largest this file is ever drawn.
                   Derived rather than guessed, and 1200px of source means it is
                   still ~2.3x oversampled there. */
                sizes={back.sizes}
                quality={85}
                className="cta-card__img"
              />
            </figure>

            <figure data-cta-card="front" className="cta-card cta-card--front">
              <Image
                src={front.image}
                alt={front.alt}
                fill
                /* 43% of 544 = 234 layout px, x1.25 = 292 device px. */
                sizes={front.sizes}
                quality={85}
                className="cta-card__img"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
