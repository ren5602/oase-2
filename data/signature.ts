/**
 * Signature panels.
 *
 * The reference's four full-bleed panels are `1200 x 800`, centred in a pinned
 * viewport, and driven through a five-phase scroll sequence measured live:
 *
 *   1  spread     stacked centre -> 2x2 corners, scaling 1 -> 0.4
 *   2  shuffle    the two right-hand panels trade vertical positions
 *   3  converge-x both columns slide to the centre line
 *   4  converge-y all four collapse onto one another
 *   5  zoom       the topmost panel scales 0.4 -> 5, filling the screen
 *
 * `corner` and `swapped` are those measured offsets, in px. They are applied to
 * an 800px-tall panel, so the spread is 500px wide by 340px tall.
 *
 * Order is DOM order, which is also stacking order — the LAST entry paints on
 * top and is the one that zooms. That is why the sandwich, the most legible of
 * the four at extreme scale, sits last.
 */

export type SignaturePanel = {
  id: string;
  title: string;
  src: string;
  alt: string;
  /** Offset from centre at the end of the spread phase. */
  corner: { x: number; y: number };
  /** Offset after the shuffle. Two panels move; two hold. */
  swapped: { x: number; y: number };
};

export const SIGNATURE_PANELS: SignaturePanel[] = [
  {
    id: "matcha",
    title: "PURE MATCHA",
    src: "/images/signature/matcha.webp",
    alt: "A bowl of vivid green matcha, whisked to a fine foam",
    corner: { x: 250, y: -170 },
    swapped: { x: 250, y: -170 },
  },
  {
    id: "latte",
    title: "COFFEE LATTE",
    src: "/images/signature/latte.webp",
    alt: "Milk being poured into a latte, forming a fern pattern in the crema",
    corner: { x: -250, y: 170 },
    swapped: { x: -250, y: 170 },
  },
  {
    id: "pizza",
    title: "PIZZA D.",
    src: "/images/signature/pizza.webp",
    alt: "A wood-fired pizza topped with basil and mozzarella",
    corner: { x: 250, y: 170 },
    swapped: { x: 250, y: -170 },
  },
  {
    id: "sandwich",
    title: "CHICKEN SANDWICH",
    src: "/images/signature/sandwich.webp",
    alt: "A toasted club sandwich with fries, cut and stacked on a board",
    corner: { x: -250, y: -170 },
    swapped: { x: -250, y: 170 },
  },
];

/**
 * Phase boundaries as a fraction of the pinned scroll travel.
 *
 * Derived from the reference, whose pin runs from document y=1700 to y=7400
 * (a 5700px travel) with phases ending at 2700 / 3900 / 5100 / 6300 / 7400:
 *
 *   (2700-1700)/5700 = 0.175   spread
 *   (3900-1700)/5700 = 0.386   shuffle
 *   (5100-1700)/5700 = 0.596   converge-x
 *   (6300-1700)/5700 = 0.807   converge-y
 *   (7400-1700)/5700 = 1.000   zoom
 */
export const PHASES = {
  spread: 0.175,
  shuffle: 0.386,
  convergeX: 0.596,
  convergeY: 0.807,
  zoom: 1,
} as const;

/** Panel geometry, from the reference. */
export const PANEL = {
  width: 1200,
  height: 800,
  /**
   * Intrinsic size the images are declared at.
   *
   * Larger than the rendered 1200px because the final phase scales the top
   * panel to 5x. The reference ships a 7074px sandwich for exactly this
   * reason; these are re-encoded to 2400px, which keeps the zoom sharp
   * without carrying the reference's 1.1MB payload.
   */
  sourceWidth: 2400,
  sourceHeight: 1600,
} as const;

/** The zoom the reference drives the top panel to. */
export const ZOOM_SCALE = 5;

/** Scale the panels settle at once the spread completes. */
export const SPREAD_SCALE = 0.4;
