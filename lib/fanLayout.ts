/**
 * Fan carousel geometry.
 *
 * Every number here was measured off the reference in a live browser by
 * decoding each card's `matrix()` into scale and rotation.
 *
 * At rest, five cards are visible around the active one. Each slot is defined
 * by its offset from the active index, and the layout is symmetric:
 *
 *   offset  scale     rotation   translate
 *   ------  --------  ---------  -----------
 *     -2     0.7756      -21deg    (-480, 116.8)
 *     -1     0.9439      -10.5deg  (-240,  29.2)
 *      0     1             0deg    (   0,   0  )
 *     +1     0.9439       10.5deg  ( 240,  29.2)
 *     +2     0.7756       21deg    ( 480, 116.8)
 *
 * Cards that fall outside that window park at `scale 0.5, translateX +/-640,
 * rotation +/-30` with `opacity: 0` — off to the side and invisible, which is
 * where they wait to be dealt back in.
 */

export type FanSlot = {
  scale: number;
  rotate: number;
  x: number;
  y: number;
  opacity: number;
  /** Paint order. The active card is highest; hidden cards are lowest. */
  z: number;
};

/** The five visible slots, keyed by distance from the active card. */
const VISIBLE: Record<number, Omit<FanSlot, "z">> = {
  [-2]: { scale: 0.7756, rotate: -21, x: -480, y: 116.8, opacity: 1 },
  [-1]: { scale: 0.9439, rotate: -10.5, x: -240, y: 29.2, opacity: 1 },
  [0]: { scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 },
  [1]: { scale: 0.9439, rotate: 10.5, x: 240, y: 29.2, opacity: 1 },
  [2]: { scale: 0.7756, rotate: 21, x: 480, y: 116.8, opacity: 1 },
};

/**
 * Where a card waits when it is out of the window.
 *
 * Measured from the reference's settled state after a step: a card that leaves
 * continues outward along the same arc, so its `y` matches the outermost
 * visible slot (116.8) rather than returning to the origin.
 */
const PARKED: Omit<FanSlot, "z"> = {
  scale: 0.5,
  rotate: 0,
  x: 0,
  y: 116.8,
  opacity: 0,
};

/**
 * Resolves the slot for one card.
 *
 * `offset` is the signed shortest distance around the ring, so the fan always
 * takes the shorter path when wrapping past either end — going from the last
 * card to the first moves one step, not five.
 */
export function slotFor(offset: number, side: 1 | -1): FanSlot {
  const visible = VISIBLE[offset];

  if (visible) {
    /* Paint order: the centre is on top and each step outwards sits behind
       the one inside it, so cards never clip the active one. */
    return { ...visible, z: 5 - Math.abs(offset) };
  }

  /* Parked. The reference sends these off in the direction they exited, so
     the card visibly leaves rather than vanishing in place. */
  return { ...PARKED, x: 640 * side, rotate: 30 * side, z: 0 };
}

/** Signed shortest distance from `active` to `index` around a ring of `n`. */
export function ringOffset(index: number, active: number, n: number): number {
  let d = index - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}
