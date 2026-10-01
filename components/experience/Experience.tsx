"use client";

import Image from "next/image";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EXPERIENCE } from "@/data/experience";
import { EASE } from "@/lib/animations";

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
 * The distance is read from the track's live `scrollWidth` at trigger time
 * rather than hardcoded, so adding or removing a panel lengthens the pin
 * automatically instead of clipping the last one. `invalidateOnRefresh` makes
 * that measurement repeat after fonts load, images settle and on resize.
 *
 * The pin is `pin: true` with `pinSpacing` left on, which is the right choice
 * here (unlike Signature, which uses CSS `position: sticky`): the section has
 * no following content that needs to overlap it, and GSAP's pin-spacer is what
 * guarantees the document is the correct total height while pinned.
 */
export default function Experience() {
  const scope = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pin = pinRef.current;
        const track = trackRef.current;
        if (!pin || !track) return;

        /* Distance is how far the track overflows its own viewport. Measured
           inside a function so ScrollTrigger re-evaluates it on every refresh
           rather than baking in the value from first paint — images and fonts
           both change it after load. */
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: EASE.none,
          scrollTrigger: {
            trigger: pin,
            /* `top top` so the pin engages the moment the section reaches the
               top of the viewport. A later start would let the user see the
               strip already part-scrolled. */
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            /* The progress bar is driven off the same trigger rather than a
               second one, so the two can never disagree. */
            onUpdate: (self) => {
              gsap.set("[data-exp-progress]", { scaleX: self.progress });
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      /* Reduced motion: no pin, no horizontal travel. The strip becomes a
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
    </section>
  );
}
