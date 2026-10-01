"use client";

import Image from "next/image";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import SplitText from "@/components/ui/SplitText";
import { SITE } from "@/data/site";
import { EASE, REVEAL } from "@/lib/animations";

gsap.registerPlugin(useGSAP);

/**
 * The reference hero.
 *
 * Every number below was measured in a live browser against the reference
 * rather than estimated from its stylesheet. The reference is a fixed 1440px
 * canvas with no media queries, so its offsets are absolute pixels that do NOT
 * scale with the viewport — the type is 132px and the cup is 1796px wide at
 * 1280, 1440, 1600 and 1920 alike. Those values are preserved verbatim, because
 * "the reference stays the source of truth" and its composition depends on
 * them: the cup's left edge lands on x=113, the exact x the headline starts at.
 *
 * Measured geometry (1440 x 900):
 *
 *   hero          100vh, overflow hidden, bg #76453b
 *   type group    inset: 154px 734px 154px 113px   -> 593 x 592
 *   MAKE          top: 0; left: 0
 *   YOUR          top: 48%; right: -8px; translateY(-50%)
 *   DAY           bottom: 9px; left: 90px
 *   cup image     1796px wide; top: -82px; right: -469px
 *   bean texture  1094px square, opacity .2; bottom: -200px; right: 516px
 *   scroll cue    112 x 39 at calc(86.25% - 19.5px) / calc(28.4722% - 56px)
 *
 * The cup and the bean texture are fixed-size and bleed off the right edge.
 * That is intentional: the reference lets the cup grow off-canvas as the
 * viewport widens, so at 1920 you see more splash and less air. "Fixing" it
 * would change the composition.
 */

/* Fixed geometry from the reference, in px at a 1440 reference width. */
const GROUP_INSET = { top: 154, right: 734, bottom: 154, left: 113 } as const;
const CUP = { width: 1796, top: -82, right: -469 } as const;
const BEANS = { size: 1094, bottom: -200, right: 516 } as const;

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Only the FRONT copy of each word is revealed. The back copy (the gold
           one the hover swaps in) is translated out of the clip window at rest,
           so animating it would be invisible work — and it would double the
           character count from 11 to 22, stretching the stagger and leaving a
           dead gap between each word. */
        const chars = gsap.utils.toArray<HTMLElement>(
          ".hero-word__line--front [data-char]",
        );
        const cup = "[data-hero-cup]";
        const cue = "[data-hero-cue]";

        /* The timeline animates FROM an explicit start state rather than using
           `gsap.from`, so nothing depends on a ScrollTrigger firing. A trigger
           at the very top of the page is easy to miss on a deep-linked load,
           and the failure mode is a blank hero. */
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });

        /* 1 — Headline. Per character, with the reference's 10px blur and 10px
               rise. Measured stagger is ~57-90ms; 70ms sits in that band. */
        tl.fromTo(
          chars,
          { opacity: 0, y: REVEAL.charRise, filter: `blur(${REVEAL.charBlur})` },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: REVEAL.charDuration,
            stagger: REVEAL.charStagger,
            /* Blur is expensive and the glyphs are settled by now, so drop the
               filter entirely rather than leaving a 0px blur on 45 elements. */
            onComplete: () => gsap.set(chars, { clearProps: "filter,willChange" }),
          },
          0,
        );

        /* 2 — Cup. The reference springs it in from far off its resting place:
              `translateX(500px) translateY(300px) scale(0.5)`, bounce 0.2.
              That flight is the hero's signature move, so it is reproduced
              rather than swapped for a fade. */
        tl.fromTo(
          cup,
          { opacity: 0, xPercent: 22, yPercent: 14, scale: 0.5 },
          {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            duration: 1.6,
            ease: EASE.spring,
          },
          0.25,
        );

        /* 3 — Bean texture. Travels on its own, slightly behind the cup. */
        tl.fromTo(
          "[data-hero-beans]",
          { opacity: 0, scale: 0.6, xPercent: 18, yPercent: 18 },
          {
            opacity: 0.2,
            scale: 1,
            xPercent: 0,
            yPercent: 0,
            duration: 1.4,
            ease: EASE.spring,
          },
          0.3,
        );

        /* 4 — Scroll cue, last, as a quiet full stop. */
        tl.fromTo(cue, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 1.1);
      });

      /* Under reduced motion the markup already renders in its final state, so
         there is nothing to undo. This branch exists purely so the timeline
         above is never constructed — the entrance is decorative, and the
         reference's own content must be visible immediately. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-word__line--front [data-char]", { clearProps: "all" });
      });

      return () => mm.revert();
    },
    { scope },
  );

  /**
   * Pointer tilt.
   *
   * The reference applies a 3D transform to the cup as the pointer moves — a
   * subtle tilt-and-scale that makes the cup read as floating in front of the
   * page rather than pasted onto it. Measured on the reference, the cup shifts
   * up to ~90px and scales to ~1.05 as the pointer crosses the hero.
   *
   * `quickTo` rather than `to`: it retargets a single tween instead of
   * spawning a new one per pointer event, which is what keeps this cheap under
   * a fast mouse. Only `transform` is touched, so nothing re-lays-out.
   *
   * Gated to fine pointers and to no-preference motion. On a touch device the
   * effect has no input to respond to, and under reduced motion it is exactly
   * the kind of movement the preference is asking to be spared.
   */
  useGSAP(
    () => {
      const cup = scope.current?.querySelector<HTMLElement>(
        "[data-hero-cup-tilt]",
      );
      if (!cup) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
        () => {
          /* Perspective is set on the element itself so the rotation reads as
             depth rather than a flat skew. */
          gsap.set(cup, { transformPerspective: 1400 });

          const opts = { duration: 1, ease: "power3.out" } as const;
          const xTo = gsap.quickTo(cup, "x", opts);
          const yTo = gsap.quickTo(cup, "y", opts);
          const rotYTo = gsap.quickTo(cup, "rotationY", opts);
          const rotXTo = gsap.quickTo(cup, "rotationX", opts);
          const scaleTo = gsap.quickTo(cup, "scale", opts);

          const onMove = (event: PointerEvent) => {
            /* Normalised to -1..1 from the viewport centre. */
            const nx = (event.clientX / window.innerWidth) * 2 - 1;
            const ny = (event.clientY / window.innerHeight) * 2 - 1;

            xTo(nx * -34);
            yTo(ny * -22);
            rotYTo(nx * 1.5);
            rotXTo(ny * -1);
            scaleTo(1.045);
          };

          /* Returning to centre on leave keeps the cup from being left tilted
             when the pointer exits the window. */
          const onLeave = () => {
            xTo(0);
            yTo(0);
            rotYTo(0);
            rotXTo(0);
            scaleTo(1);
          };

          window.addEventListener("pointermove", onMove);
          document.addEventListener("pointerleave", onLeave);

          return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
          };
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="home"
      data-theme="dark"
      aria-label={`${SITE.name} — ${SITE.tagline}`}
      className="themed relative isolate min-h-[var(--screen-h)] overflow-hidden bg-coffee"
    >
      {/* ==================================================================
          Bean texture — bottom-left of centre, behind everything.
          `opacity: .2` is the reference's value, applied here as the resting
          state so reduced-motion users get it without the timeline running.
          GSAP animates 0 -> 0.2 and 0.6 -> 1 scale.
         ================================================================== */}
      <div
        data-hero-beans
        aria-hidden="true"
        className="pointer-events-none absolute opacity-20"
        style={{
          width: `${BEANS.size}px`,
          height: `${BEANS.size}px`,
          bottom: `${BEANS.bottom}px`,
          right: `${BEANS.right}px`,
        }}
      >
        <Image
          src="/images/hero/bean-cluster.webp"
          alt=""
          width={1100}
          height={1100}
          priority
          sizes="1094px"
          className="h-full w-full"
        />
      </div>

      {/* ==================================================================
          The cup. Fixed 1796px, bleeding off the right edge and below the
          fold. Its left edge falls on x=113 — the same x the headline starts
          at. That alignment is the reference's, not an accident.

          TWO nested elements on purpose. The outer one is driven by the
          entrance timeline (`xPercent` / `yPercent` / `scale`); the inner one
          is driven by the pointer tilt (`x` / `y` / `rotationX` / `rotationY`).

          They must not share a node. Both write to `transform`, and the tilt
          sets `transformPerspective`, which forces GSAP to re-parse and
          rewrite the whole matrix — if that lands while the entrance timeline
          is mid-flight, the two writers clobber each other and the cup is left
          stranded at its start state.
         ================================================================== */}
      <div
        data-hero-cup
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: `${CUP.width}px`,
          top: `${CUP.top}px`,
          right: `${CUP.right}px`,
        }}
      >
        <div data-hero-cup-tilt className="h-full w-full">
          <Image
            src="/images/hero/oase-cup-coffee.webp"
            alt=""
            width={1400}
            height={788}
            priority
            fetchPriority="high"
            sizes="1796px"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* ==================================================================
          Headline. The real <h1> is exposed to assistive tech and the visible
          composition is hidden from it, because a screen reader should hear
          "MAKE YOUR DAY", not "M A K E".
         ================================================================== */}
      <h1 className="sr-only">
        {SITE.name} — {SITE.tagline}
      </h1>

      <div
        className="absolute"
        style={{
          top: `${GROUP_INSET.top}px`,
          right: `${GROUP_INSET.right}px`,
          bottom: `${GROUP_INSET.bottom}px`,
          left: `${GROUP_INSET.left}px`,
        }}
      >
        <div aria-hidden="true" className="relative h-full w-full">
          {/* MAKE — flush to the group's top-left. */}
          <div className="absolute top-0 left-0">
            <div className="hero-word display text-hero">
              <div className="hero-word__stack">
                <SplitText text="MAKE" className="hero-word__line hero-word__line--front" />
                <SplitText text="MAKE" className="hero-word__line hero-word__line--back" />
              </div>
            </div>
          </div>

          {/* YOUR — pushed to the group's right edge and overhanging it by
              8px, vertically centred on the 48% line. */}
          <div className="absolute top-[48%] right-[-8px] -translate-y-1/2">
            <div className="hero-word display text-hero">
              <div className="hero-word__stack">
                <SplitText text="YOUR" className="hero-word__line hero-word__line--front" />
                <SplitText text="YOUR" className="hero-word__line hero-word__line--back" />
              </div>
            </div>
          </div>

          {/* DAY — indented 90px, resting 9px above the group's bottom edge. */}
          <div className="absolute bottom-[9px] left-[90px]">
            <div className="hero-word display text-hero">
              <div className="hero-word__stack">
                <SplitText text="DAY" className="hero-word__line hero-word__line--front" />
                <SplitText text="DAY" className="hero-word__line hero-word__line--back" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          Scroll cue. Both anchors are the reference's: 86.25% of the hero's
          height and 28.4722% of its width. The arrow sits *inside* the text's
          box, overlapping under the word "down" — reproduced as-is.
         ================================================================== */}
      <a
        data-hero-cue
        href="#signature"
        className="cue absolute z-10 block"
        style={{
          top: "calc(86.25% - 19.5px)",
          left: "calc(28.4722% - 56px)",
          width: "112px",
          height: "39px",
        }}
      >
        {/* Lowercase, 20px, weight 600 — the reference sets this in sentence
            case. `.display` is deliberately NOT used here: it would force
            uppercase, which is both wrong and wide enough to wrap the label
            out of its 112px box. */}
        <span className="block text-[20px] leading-[25px] font-semibold text-white">
          scroll down
        </span>

        {/* The reference's own chevron, path-for-path. It already points down —
            the flat edge sits at y=7.07 and the apex at y=13.86 — so it is used
            unrotated. */}
        <span
          className="cue__arrow absolute"
          style={{ left: "48.5px", top: "25px" }}
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" focusable="false">
            <path
              d="M0.682843 7.75391C0.430857 7.50192 0.609324 7.07107 0.965685 7.07107H7.07107H13.1765C13.5328 7.07107 13.7113 7.50192 13.4593 7.75391L7.35391 13.8593C7.1977 14.0155 6.94443 14.0155 6.78823 13.8593L0.682843 7.75391Z"
              fill="#D9D9D9"
            />
          </svg>
        </span>

        <span className="sr-only">{SITE.statement}</span>
      </a>
    </section>
  );
}
