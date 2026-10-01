"use client";

import Image from "next/image";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EXPERIENCE } from "@/data/experience";
import { EASE } from "@/lib/animations";
import { layoutWidth } from "@/lib/viewport";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Experience — vertical scroll drives horizontal travel.
 *
 * NOT in the reference. Original work in the language Hero, Signature and Menu
 * established.
 *
 * How it works: the section is pinned for the length of the strip's horizontal
 * overflow, and the track is translated by that same distance with `scrub`, so
 * the two axes stay locked together — one scroll position maps to exactly one
 * horizontal offset, with no separate scrollbar to desynchronise.
 *
 * The distance is read from the track's live `scrollWidth` rather than
 * hardcoded, so adding or removing a panel lengthens the rail automatically
 * instead of clipping the last one.
 *
 * ---------------------------------------------------------------------------
 * `position: sticky`, NOT GSAP's `pin: true`
 *
 * This section originally used GSAP's pin, and it worked — until the page
 * started magnifying itself above 1536 (see PAGE ZOOM in `globals.css`). GSAP's
 * pin writes its spacer in LAYOUT px but measures its `end` in SCROLL px
 * (device px), and under zoom those are different units. Measured on the built
 * page at 1920x960 with `zoom: 1.25`:
 *
 *   strip overflow (layout)                841
 *   strip overflow x zoom (device)        1051.3
 *   pin-spacer extra height (device)      1051.3   <- GSAP scaled the spacer
 *   `end: '+=' + distance()` (scroll px)   841     <- but not the duration
 *
 * So the spacer reserved 1051 device px of scroll while the pin only lasted
 * 841, and at release the section jumped 191px down the screen before sitting
 * still for the rest of the rail. Scaling `distance()` by the zoom for `end`
 * alone made it worse (263px), because it then over-reserved by the same
 * factor. There is no value that satisfies both constraints, because one
 * number cannot be in two units.
 *
 * `position: sticky` has no such split: the rail's height and the sticky
 * child's height are both layout px, so the browser computes the pinned range
 * in the same coordinate space the layout is built in, and it comes out right
 * at every zoom. It also removes the pin-spacer from the document entirely,
 * which is why the section now has an explicit `.exp-rail` parent — the rail
 * IS the scroll distance, and `--exp-dist` (written from JS, in layout px)
 * is what makes it exactly as tall as the strip is wide.
 *
 * This is the same mechanism Signature uses, for the same reason.
 */
export default function Experience() {
  const scope = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rail = railRef.current;
        const pin = pinRef.current;
        const track = trackRef.current;
        if (!rail || !pin || !track) return;

        /* Distance is how far the track overflows its own viewport, in LAYOUT
           px. Everything here is layout px — the rail's height, the sticky
           child's height and this distance — so the pinned range is computed
           in one coordinate space and comes out right at every zoom.

           `layoutWidth()` and NOT `window.innerWidth`, and the difference is a
           real bug rather than a nicety: `scrollWidth` is LAYOUT px while
           `innerWidth` is DEVICE px, so on a magnified page subtracting one
           from the other makes the strip travel 25% too short and strands the
           last panel off-screen. Measured at 1920 with a 1.25 zoom: the last
           card came to rest at x=1750 in a 1920 window instead of landing at
           the right edge. */
        const distance = () => Math.max(0, track.scrollWidth - layoutWidth());

        /* The rail is exactly one viewport plus the travel, which is what
           gives the sticky child its scroll range. Written as a custom property
           on the rail rather than a fixed height in CSS, because the distance
           is a measurement, not a design value.

           Re-measured on every refresh rather than once: images and fonts both
           change the track's width after first paint, and a stale height would
           clip the last panel or leave a stretch of dead scroll at the end. */
        const measure = () => {
          rail.style.setProperty("--exp-dist", `${distance()}px`);
        };

        measure();
        window.addEventListener("resize", measure);

        /* The tween is driven off a ScrollTrigger that *reads* the rail rather
           than pinning it — the sticky child holds itself in place, so there is
           no pin-spacer and nothing for ScrollTrigger to mutate. `scrub: 1`
           keeps the strip a touch behind the scrollbar, which is what stops it
           feeling welded to the input.

           `invalidateOnRefresh` re-runs both the distance function and the
           measurement when ScrollTrigger refreshes, so the strip and the rail
           can never disagree about how far they go. */
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: EASE.none,
          scrollTrigger: {
            trigger: rail,
            /* `top top` so the sticky engages the moment the rail reaches the
               top of the viewport. A later start would let the user see the
               strip already part-scrolled. */
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: measure,
            /* The progress bar is driven off the same trigger rather than a
               second one, so the two can never disagree. */
            onUpdate: (self) => {
              gsap.set("[data-exp-progress]", { scaleX: self.progress });
            },
          },
        });

        return () => {
          window.removeEventListener("resize", measure);
          tween.scrollTrigger?.kill();
          tween.kill();
          rail.style.removeProperty("--exp-dist");
        };
      });

      /* Reduced motion: no sticky, no horizontal travel. The strip becomes a
         native horizontal scroller so every panel is still reachable, and the
         progress bar is removed because there is nothing to track. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-exp-progress]", { scaleX: 1 });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="experience"
      data-theme="ink"
      aria-labelledby="experience-heading"
      className="themed bg-coffee-dark"
    >
      {/* The rail supplies the scroll distance; the sticky child holds still
          while the tween advances. */}
      <div ref={railRef} className="exp-rail">
        <div ref={pinRef} className="exp-pin">
          <div className="exp-head">
            <h2 id="experience-heading" className="display text-section text-cream">
              THROUGH THE DAY
            </h2>
            <p className="label hidden text-cream/50 md:block">
              {EXPERIENCE.length} moments — scroll to travel
            </p>
          </div>

          {/* `aria-label` on the list rather than a visually-hidden heading: the
              panels are a sequence, and the list role already conveys that. */}
          <div
            ref={trackRef}
            data-exp-track
            role="list"
            aria-label="Moments through the day"
            className="exp-track"
          >
            {EXPERIENCE.map((panel) => (
              <article
                key={panel.id}
                role="listitem"
                data-exp-panel
                className="exp-panel"
              >
                <div
                  className="exp-panel__frame"
                  style={{ "--aspect": panel.aspect } as React.CSSProperties}
                >
                  <Image
                    src={panel.image}
                    alt={panel.alt}
                    fill
                    /* The tallest the image is ever drawn, so the browser picks a
                       source that stays sharp on a large display. */
                    sizes="(max-width: 1440px) 60vw, 560px"
                    className="exp-panel__img"
                  />
                </div>

                <div className="exp-panel__meta">
                  <p className="label text-amber">{panel.index}</p>
                  <h3 className="exp-panel__title display">{panel.title}</h3>
                  <p className="exp-panel__desc">{panel.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="exp-progress" aria-hidden="true">
            <span data-exp-progress className="exp-progress__fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
