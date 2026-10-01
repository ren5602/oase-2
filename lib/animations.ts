import gsap from "gsap";

/**
 * Shared motion tokens.
 *
 * Values are calibrated against the reference's own behaviour, measured in a
 * real browser rather than guessed. Where GSAP has no spring, `EASE.spring`
 * approximates Framer's `bounce: 0.2` — a gentle overshoot, not a rubber band.
 */

export const EASE = {
  /** Strong ease-out. The default for entrances. */
  out: "power3.out",
  /** Slight overshoot, standing in for a low-bounce spring. */
  spring: "back.out(1.15)",
  /** Mechanical. For scrubbed timelines that must track scroll exactly. */
  none: "none",
} as const;

export const DUR = {
  fast: 0.35,
  base: 0.8,
  slow: 1.2,
} as const;

/**
 * The reference reveals its hero headline one character at a time — each
 * starting at `opacity: 0.001` with a 10px blur and a 10px drop, over roughly
 * 1.2s with a ~90ms stagger. These are those values.
 */
export const REVEAL = {
  charDuration: 1.2,
  charStagger: 0.09,
  charBlur: "10px",
  charRise: 10,
} as const;

/**
 * The reference's per-character text effect, measured properly.
 *
 * Sampling the Signature heading at 60fps gives the effect's real shape. It is
 * the same effect the hero uses — identical `blur(10px)` and identical 10px
 * rise — so these are the authoritative numbers for both:
 *
 *   stagger            50ms, forward, consistent to ±5ms across 17 characters
 *   trigger            heading top reaching the viewport bottom
 *   repeat             one-shot; it does not reset when scrolled away
 *
 * The easing is NOT a power curve. Fitting the measured opacity trace against
 * every candidate gives:
 *
 *   critically damped spring           RMS 0.0117
 *   cubicOut / power2                  RMS 0.0314
 *   quartOut / power3                  RMS 0.0357
 *
 * The spring wins by nearly 3x, which matches how Framer animates text by
 * default. `EASE_TEXT` below builds it.
 */
export const TEXT_EFFECT = {
  /* `duration` does NOT set the speed of this effect — see the note on
     `criticallyDamped`. It only controls how finely the spring is sampled, and
     is kept high so the normalisation constant `K` stays large. The speed is
     tuned with `OMEGA` below. */
  duration: 2.35,
  stagger: 0.05,
  blur: "10px",
  rise: 10,
  /** Where the reveal fires. The heading's top at the viewport's bottom. */
  start: "top bottom",
} as const;

/**
 * A critically damped spring as a GSAP ease function.
 *
 * `1 - (1 + x)e^-x` is the exact solution for a critically damped system —
 * fast initial acceleration, a long smooth tail, and no overshoot.
 *
 * IMPORTANT — `duration` does not affect wall-clock timing here. Solving the
 * curve for a given fraction f gives a fixed `x_f`, and since `x = K * p` with
 * `K = omega * duration` while `p = t / duration`, the duration cancels:
 *
 *     t_f = x_f / omega
 *
 * So the tween's `duration` only sets how finely the curve is sampled; the
 * speed is governed entirely by `omega`. Raising duration alone changes
 * nothing. `OMEGA` is therefore the single tuning knob.
 *
 * `duration` is still passed so `K` stays large enough for the normalisation
 * to be stable — a small `K` would make the curve approach a straight line.
 */
function criticallyDamped(omega: number, duration: number) {
  const K = omega * duration;
  const norm = 1 - (1 + K) * Math.exp(-K);
  return (p: number) => {
    if (p >= 1) return 1;
    const x = K * p;
    return (1 - (1 + x) * Math.exp(-x)) / norm;
  };
}

/**
 * Fitted to the reference's measured opacity trace.
 *
 * The analytical fit put omega at 8.4 (RMS 0.0117 against the reference,
 * versus 0.0314 for the best power curve). Rendered, that ran ~25ms fast at
 * the 50% crossing, because GSAP applies its first update a frame or two after
 * the trigger fires and the reference's own Framer runtime does the same.
 *
 * Since `t = x / omega`, timing is inversely proportional to omega. Two
 * measured points (8.4 -> 170ms, 7.2 -> 217ms) fix the constant at ~1495, and
 * 7.48 lands the 50% crossing on the reference's 200ms.
 */
const OMEGA = 7.48;

export const EASE_TEXT = criticallyDamped(OMEGA, TEXT_EFFECT.duration);

/** Splits a string into words, each broken into its own characters. */
export function splitIntoChars(text: string): { word: string; chars: string[] }[] {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => ({ word, chars: Array.from(word) }));
}

/**
 * The "from" half of the text effect. Kept as a function rather than a shared
 * object so callers cannot mutate one another's vars.
 *
 * `opacity: 0` rather than the reference's `0.001`: the reference writes that
 * value inline into the SSR markup, which is why its heading is invisible
 * until JS runs. Starting from the tween instead means the text renders
 * normally when JS is unavailable, and the reveal is pure enhancement.
 */
export function textRevealFrom() {
  return {
    opacity: 0,
    y: TEXT_EFFECT.rise,
    filter: `blur(${TEXT_EFFECT.blur})`,
  };
}

/** The "to" half. `extra` lets a caller add a trigger or a callback. */
export function textRevealTo(extra: Record<string, unknown> = {}) {
  return {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    duration: TEXT_EFFECT.duration,
    stagger: TEXT_EFFECT.stagger,
    ease: EASE_TEXT,
    ...extra,
  };
}

/** Drops the blur once the reveal has finished — 17 blurred glyphs is real GPU
 *  cost to leave running for the life of the page. */
export function clearTextReveal(elements: HTMLElement[]) {
  gsap.set(elements, { clearProps: "filter,willChange" });
}
