"use client";

import Image from "next/image";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  PANEL,
  PHASES,
  SIGNATURE_PANELS,
  SPREAD_SCALE,
  ZOOM_SCALE,
} from "@/data/signature";
import SplitText from "@/components/ui/SplitText";
import {
  clearTextReveal,
  EASE,
  TEXT_EFFECT,
  textRevealFrom,
  textRevealTo,
} from "@/lib/animations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Signature.
 *
 * The reference does NOT crossfade four images. All four panels are on screen
 * the entire time, stacked at centre, and scroll drives them through a
 * five-phase choreography:
 *
 *   1  spread      stack -> 2x2 corners,  scale 1 -> 0.4
 *   2  shuffle     the two right-hand panels trade vertical positions
 *   3  converge-x  both columns slide to the centre line
 *   4  converge-y  all four collapse onto one another
 *   5  zoom        the top panel scales 0.4 -> 5, filling the screen
 *
 * Every offset, scale and phase boundary here was measured off the reference
 * at 1440x900 rather than inferred. The four "cards" are never separate
 * objects — they are one image repeated at four positions, which is why the
 * section reads as a composition instead of a card grid.
 *
 * Scroll drives it, not hover. The reference has no hover state on the panels
 * (verified: `cursor: auto`, no transform change on pointer-over), so none was
 * invented here.
 */

const PANEL_COUNT = SIGNATURE_PANELS.length;

export default function Signature() {
  const scope = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---- heading reveal -------------------------------------------
           The reference splits "TASTE OUR SIGNATURE" into 17 per-character
           spans and reveals them with a 50ms stagger, each rising 10px out of
           a 10px blur over ~0.78s. Measured at 60fps, the stagger holds to
           within 5ms across the whole string.

           It fires once, when the heading's top reaches the viewport bottom,
           and does NOT reset on scroll-back — hence `once: true` rather than a
           toggle, which would re-run the animation every time the user
           scrolled past. */
        const headingChars = gsap.utils.toArray<HTMLElement>(
          "#signature-heading [data-char]",
        );

        if (headingChars.length) {
          gsap.fromTo(
            headingChars,
            textRevealFrom(),
            textRevealTo({
              scrollTrigger: {
                trigger: "#signature-heading",
                start: TEXT_EFFECT.start,
                once: true,
              },
              onComplete: () => clearTextReveal(headingChars),
            }),
          );
        }

        const track = trackRef.current;
        if (!track) return;

        const panels = gsap.utils.toArray<HTMLElement>("[data-sig-panel]");
        if (panels.length !== PANEL_COUNT) return;

        /* One timeline, scrubbed. `defaults.ease` is `none` because a scrubbed
           timeline must track the scrollbar exactly — easing it would make the
           panels lag the scroll and feel disconnected from the input. */
        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: {
            trigger: track,
            /* `top top` is what makes the pin engage the moment the section
               reaches the top of the viewport. `top center` would let the user
               see half the first transition before it started. */
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        const dur = (from: number, to: number) => (to - from) * 100;

        /* ---- 1. spread -------------------------------------------------
           Panels begin stacked and on top of each other at scale 1, then move
           out to their corners as they shrink to 0.4. */
        tl.to(
          panels,
          {
            x: (i) => SIGNATURE_PANELS[i].corner.x,
            y: (i) => SIGNATURE_PANELS[i].corner.y,
            scale: SPREAD_SCALE,
            duration: dur(0, PHASES.spread),
          },
          0,
        );

        /* ---- 2. shuffle ------------------------------------------------
           Only two panels move. The left column holds, the right column
           swaps — the diagonal seam this creates is the section's signature
           moment. */
        tl.to(
          panels,
          {
            x: (i) => SIGNATURE_PANELS[i].swapped.x,
            y: (i) => SIGNATURE_PANELS[i].swapped.y,
            duration: dur(PHASES.spread, PHASES.shuffle),
          },
          dur(0, PHASES.spread),
        );

        /* ---- 3. converge on x ------------------------------------------ */
        tl.to(
          panels,
          {
            x: 0,
            duration: dur(PHASES.shuffle, PHASES.convergeX),
          },
          dur(0, PHASES.shuffle),
        );

        /* ---- 4. converge on y -----------------------------------------
           Two separate tweens rather than one diagonal move: the reference
           collapses the columns first, then the rows. Doing both at once
           reads as a diagonal slide instead of an implosion. */
        tl.to(
          panels,
          {
            y: 0,
            duration: dur(PHASES.convergeX, PHASES.convergeY),
          },
          dur(0, PHASES.convergeX),
        );

        /* ---- 5. zoom --------------------------------------------------
           Only the LAST panel zooms. Because the panels are absolutely
           positioned siblings in DOM order, that one also paints on top, so
           it covers the other three as it grows past them.

           `.to`, not `.fromTo`. The spread above already brought every panel
           to 0.4, so a `fromTo` would re-assert `scale: 0.4` as this tween's
           start value *from time zero* — and since a scrubbed timeline renders
           its state at every position, that pinned the panel at 0.4 for the
           entire pre-pin approach and flattened the opening. */
        const top = panels[PANEL_COUNT - 1];
        tl.to(
          top,
          {
            scale: ZOOM_SCALE,
            duration: dur(PHASES.convergeY, PHASES.zoom),
          },
          dur(0, PHASES.convergeY),
        );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      /* Reduced motion: the panels render in their spread state and stay
         there, so the section is a static 2x2 composition rather than a
         pile of four images on one another. This is set in CSS-adjacent JS
         rather than left to the markup, because the resting state of the
         timeline is "stacked", which would be unreadable. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-sig-panel]");
        panels.forEach((panel, i) => {
          gsap.set(panel, {
            x: SIGNATURE_PANELS[i].corner.x,
            y: SIGNATURE_PANELS[i].corner.y,
            scale: SPREAD_SCALE,
          });
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="signature"
      data-theme="light"
      aria-labelledby="signature-heading"
      className="themed relative bg-cream"
    >
      {/* ---------------------------------------------------------------
          Opening beat. The heading is centred in its own full-height block
          before the pinned stage begins, which is what gives the section its
          slow, unhurried entrance.

          `--screen-h` rather than `min-h-screen` (`100vh`): the page is
          magnified above 1536, and a raw viewport unit would make this block
          taller than the viewport it is meant to fill.
         --------------------------------------------------------------- */}
      <div className="flex min-h-[var(--screen-h)] items-center justify-center px-6">
        {/* The heading is split per character for the reveal, which destroys
            its accessible name: the two lines concatenate to "TASTEOUR
            SIGNATURE", and `SplitText`'s per-word `aria-label`s are on plain
            spans, which screen readers do not reliably announce.

            So the <h2> carries the real text and the visual composition is
            hidden from assistive tech — the same pattern the Hero uses. */}
        <h2
          id="signature-heading"
          aria-label="TASTE OUR SIGNATURE"
          className="display text-section flex w-[521px] flex-col text-center text-ink/70"
        >
          <span aria-hidden="true" className="contents">
            <SplitText text="TASTE" className="block" />
            <SplitText text="OUR SIGNATURE" className="block" />
          </span>
        </h2>
      </div>

      {/* ---------------------------------------------------------------
          Pinned stage. The track supplies the scroll distance; the sticky
          child holds still while the timeline advances.
         --------------------------------------------------------------- */}
      <div ref={trackRef} className="sig-track">
        <div className="sig-sticky">
          <div className="sig-stage">
            {SIGNATURE_PANELS.map((panel, index) => (
              <figure
                key={panel.id}
                data-sig-panel
                className="sig-panel"
                /* Stacking order follows DOM order, so the last panel wins —
                   and it is the one that zooms. */
                style={{ zIndex: index + 1 }}
              >
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  width={PANEL.sourceWidth}
                  height={PANEL.sourceHeight}
                  /* `sizes` must describe the LARGEST size this image is ever
                     rendered at, not its resting size. The resting panel is
                     1200px, but the zoom scales it to 5x — 6000px — and if
                     `sizes` says 1200px the browser never asks for anything
                     bigger than that, so the zoom upscales a 1200px file no
                     matter how large the source on disk is.
                     `min()` clamps the claim to the real source width so the
                     srcset never advertises a candidate that does not exist. */
                  sizes={`min(${PANEL.sourceWidth}px, 500vw)`}
                  quality={90}
                  priority={index === PANEL_COUNT - 1}
                  className="sig-panel__img"
                />

                <figcaption className="sig-caption">
                  <p className="sig-caption__title">{panel.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
