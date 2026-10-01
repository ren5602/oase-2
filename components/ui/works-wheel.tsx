"use client";

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { pageZoom } from "@/lib/viewport";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
  /** Numeral for the index. OASE's sections run on 01/02/03. */
  index?: string;
  /** One line shown under the front title. Omit to drop it. */
  description?: string;
  /** Alt text. Falls back to the title when omitted. */
  alt?: string;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default undefined */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.34; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.124; // ring label and front-card title
const INDEX = 0.04; // the index down the right-hand side
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6;

/** Scroll distance, in pixels, that turns the wheel by one item.
    A mouse notch is 100px in Chrome and Edge and 48px in Firefox (which
    reports lines), so one notch is one item and a trackpad — which delivers a
    stream of small deltas — takes a short flick. */
const NOTCH = 100;
/** Firefox reports `deltaMode: 1` with the delta counted in lines. */
const LINE_HEIGHT = 16;

/** How much of a dragged pixel counts as one item.
    In LAYOUT px, which is why the drag handler divides the pointer's DEVICE px
    by the page zoom before comparing against it — otherwise a magnified page
    would drag the wheel 1.25x as far per pixel as the same gesture at zoom 1. */
const DRAG_UNITS = 420;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

/** The ring's share of the stage height. See the note in `metrics`. */
const RING_FIT = 0.9;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const descRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;

    /* Ring radius, SOLVED rather than fixed.

       The ring's vertical extent is `2·ringR + cardH·ringScale`, and
       `ringScale` is itself proportional to `ringR` (it is the card size that
       makes `count` of them close the circle), so the whole thing is linear in
       `ringR` and has a closed form:

         extent = ringR · (2 + 2π·0.82 / (count · CARD_RATIO))

       Solving that for a ring that fits the stage is what stops the top and
       bottom cards being sliced off. The fixed `cardH · 1.14` this replaces
       produced a 998px ring inside a 900px stage at 1440x900 — 49px cut from
       each end, which is precisely the "closed loop" read the ring is for.
       The cap keeps the original design value on stages tall enough to take
       it, so nothing changes where there was already room. */
    const ringCoef = 2 + (2 * Math.PI * 0.82) / (count * CARD_RATIO);
    const ringR = count
      ? Math.min(cardH * RING_R, (h * RING_FIT) / ringCoef)
      : cardH * RING_R;
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      // That set-back has to arrive with the drum, or the ring would sit at the
      // far side of the perspective and render at half its size.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // Culled by distance, not by angle: at a full turn the far side comes
          // back round to face us, and everything past the neighbours lands on
          // the vanishing point in a heap.
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      if (descRef.current) descRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  /* Whether the wheel is the thing on screen.

     The section is exactly one viewport tall, so this is true once the stage's
     top reaches the top of the viewport — at which point the wheel fills the
     frame and taking the scroll is reasonable.

     It exists because taking the scroll ANY EARLIER is a trap. The wheel is the
     last thing on the page, so while the reader is still scrolling down into
     it, the page scroll is the only way to finish arriving — and an ungated
     handler would cancel every gesture and strand them with the section half
     off the top of the screen. Measured: the page stuck at the section top
     sitting 430px down, with no way to move it.

     Read in a passive scroll listener rather than inside the wheel handler, so
     the handler itself stays free of layout reads. */
  const inPlace = React.useRef(false);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const read = () => {
      // 2px of tolerance for fractional scroll offsets and subpixel layout.
      inPlace.current = el.getBoundingClientRect().top <= 2;
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  /* Pixels of scroll carried toward the next item.

     The wheel moves in whole items, so a gesture that does not yet add up to a
     full notch has to be remembered rather than dropped — a trackpad delivers
     its travel as a stream of small deltas and none of them is a notch on its
     own. */
  const carry = React.useRef(0);

  // Native listener, because the wheel has to be cancellable — and it only
  // cancels while it still has somewhere to go, so the page scrolls on at
  // either end instead of trapping the reader.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      /* Normalise `deltaMode` first. Chrome and Edge report pixels, but
         Firefox reports LINES (mode 1) — 3 lines per notch, which read as 3px
         would never add up to a notch at all and the wheel would simply never
         turn there. */
      const per =
        event.deltaMode === 1
          ? LINE_HEIGHT
          : event.deltaMode === 2
            ? el.clientHeight
            : 1;
      const px = event.deltaY * per;

      // Carried pixels only mean anything in the direction they were going:
      // hold 80px of downward travel and the first upward notch would be
      // swallowed by it.
      if (px * carry.current < 0) carry.current = 0;

      const room =
        px > 0 ? target.current < last + 1 : target.current > 0;

      if (!inPlace.current || !room) {
        carry.current = 0;
        return;
      }

      /* Consume the event. This is safe precisely because `room` held: there is
         somewhere for the wheel to go in this direction. */
      event.preventDefault();

      const steps = Math.trunc((carry.current + px) / NOTCH);

      if (steps === 0) {
        carry.current += px;
        return;
      }

      const next = clamp(target.current + steps, 0, last + 1);
      const applied = next - target.current;
      target.current = next;
      /* Keep the remainder so a fast burst does not lose its tail — but only
         when nothing was clamped away, since otherwise the leftover belongs to
         travel that did not happen. */
      carry.current =
        applied === steps ? carry.current + px - steps * NOTCH : 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [last]);

  const drag = React.useRef<number | null>(null);

  return (
    <section
      aria-label={label}
      className={cn(
        "relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          drag.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current === null) return;
          /* `clientY` is DEVICE px while `DRAG_UNITS` is a layout-px design
             constant, so the delta is converted before it is compared against
             it. Without the division a magnified page drags 1.25x as far per
             pixel as the same gesture at zoom 1 — the wheel would overshoot
             whatever the pointer did. */
          const dy = (drag.current - event.clientY) / pageZoom();
          to(target.current + dy / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={() => {
          /* Land on an item rather than between two.

             `turn` runs 0 (ring) -> 1 (drum, item 0) -> 2 (item 1) and so on,
             so rounding always lands on a rest state. The guard this replaces
             was `if (target.current > 1)`, which skipped the whole 0..1 range —
             exactly the ring-to-drum transition. Releasing a drag partway
             through it left the wheel at, say, 0.48: the ring label at half
             opacity over a half-turned drum, which is neither state and has no
             way back. Measured at 30/60/120/200px of drag; 10px and 420px
             happened to clear it, which is why it looked intermittent. */
          drag.current = null;
          to(Math.round(target.current));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            return (
              <React.Fragment key={item.title}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden]"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="wheel-card">
                    {/* `next/image` rather than `<img>`: every other image in
                        this project goes through it, and the cards are large
                        enough that the optimisation is worth having. `fill`
                        because the card's own size is set from measured
                        geometry, not from the image's intrinsic size. */}
                    <Image
                      src={item.image}
                      alt={item.alt ?? item.title}
                      fill
                      draggable={false}
                      sizes="(max-width: 1440px) 34vw, 420px"
                      className="object-cover"
                    />
                    {action && item.href ? (
                      /* Deliberately NOT themed. This chip is a scrim that sits
                         on the photograph itself, not on the section ground, so
                         it follows `.sig-caption`'s convention of dark-over-
                         image rather than the section's theme. */
                      <span className="pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full bg-coffee-dark/80 px-2.5 py-1 text-[0.7rem] text-cream opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Ring title and front-card title trade places across the transition.
          Type is sized off the measured stage, not vh, so the wheel keeps its
          proportions inside a card as well as at full bleed.

          Colour comes from `--section-fg` rather than a literal, because the
          wheel is a `ui/` primitive and the section it sits in decides its own
          ground. */}
      <div
        ref={labelRef}
        className="display wheel-fg pointer-events-none absolute inset-0 grid place-items-center tracking-tight"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-1/2 left-[8%] -translate-y-1/2 opacity-0"
        style={{ fontSize: metrics.title }}
      >
        <span className="display wheel-fg block">{items[active]?.title}</span>
      </div>
      {/* The stage description, revealed with the front title. Kept in the
          same block so the two can never desynchronise. */}
      <div
        ref={descRef}
        className="wheel-muted pointer-events-none absolute top-1/2 left-[8%] max-w-[26ch] translate-y-[calc(50%+1.6em)] opacity-0"
        style={{ fontSize: metrics.index * 0.92 }}
      >
        {items[active]?.description}
      </div>

      {/* The index, anchored to the same gutter as the nav pill.

          It used to be `top-[7.5%] right-[2.5%]` — percentages of the viewport
          — which put it out of line with the pill on both axes, because the
          pill is anchored to `.shell` instead:

            viewport   pill right   index right   drift
            1280x900       1216          1248       32px
            1600x900       1488          1560       72px
            1920x1080      1648          1872      224px

          The drift grows with the viewport, because `.shell` is capped at
          96rem and centred while a percentage is not. Vertically it was worse
          than cosmetic: 7.5% is 68px at 900px tall but 49px at 650px, and the
          pill occupies 12..56px — so on a short viewport the first row sat
          INSIDE the pill.

          Wrapping it in `.shell` makes both edges the pill's own by
          construction: the same container, the same `padding-inline`, the same
          centring. `--nav-clearance` replaces the percentage on the other
          axis. */}
      <div className="pointer-events-none absolute inset-x-0 top-[var(--nav-clearance)]">
        <div className="shell">
          <ol
            className="pointer-events-auto ml-auto w-fit text-right leading-[1.75]"
            style={{ fontSize: metrics.index }}
          >
            {items.map((item, i) => (
              <li key={item.title} className="flex items-baseline justify-end gap-2">
                {item.index ? (
                  <span className="label wheel-accent">{item.index}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => to(i + 1)}
                  className={cn(
                    "cursor-pointer transition-colors outline-none focus-visible:outline-1 focus-visible:outline-current",
                    // Either/or rather than both-with-one-overriding. The two
                    // classes set the same property at the same specificity, so
                    // having both would make the winner depend on their order in
                    // the stylesheet — which is exactly the kind of coupling that
                    // breaks silently when a rule is moved.
                    i === active ? "wheel-fg font-medium" : "wheel-muted",
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default WorksWheel;