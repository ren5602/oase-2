/**
 * Gallery.
 *
 * NOT in the reference. The Framer build covers Hero, Signature and Menu only,
 * so this section is original work in the language those three established.
 *
 * ---------------------------------------------------------------------------
 * MASONRY, NOT A JUSTIFIED GRID
 *
 * The layout reference is a Pinterest-style masonry: uniform-width columns,
 * variable heights, rounded cards, a caption under each. That replaces the
 * justified grid this section shipped with, which forced every row to a common
 * height and therefore had to derive each width from its photograph's ratio.
 *
 * The masonry does the opposite — width is fixed and height follows the ratio —
 * which is why `aspect` is still here but is now read the other way round. The
 * mechanism is in `.gal-cols` / `.gal-col` in `globals.css`.
 *
 * ---------------------------------------------------------------------------
 * WHY THE COLUMNS ARE GROUPED THE WAY THEY ARE
 *
 * A column's height is the sum of its photographs' rendered heights plus their
 * captions and gaps. Which photographs share a column therefore decides how
 * ragged the bottom edge is, and with twelve tiles there are 4^12 ≈ 16.7M
 * partitions — small enough to solve EXACTLY rather than greedily.
 *
 * The partition below is the optimal one, found by exhaustive search (bitmask
 * DP over subsets, minimising the tallest column). Measured at a 338px column:
 *
 *   col 1  1177px   pastry · sign · pour-over
 *   col 2  1196px   workbench · espresso · beans
 *   col 3  1174px   daylight · evening-room · latte
 *   col 4  1196px   counter · from-above · menu-board
 *
 * Tallest 1196px, ragged bottom 22px — 1.8%. A greedy DOM-order fill leaves
 * ~450px, which reads as a broken column rather than a deliberate one.
 *
 * ---------------------------------------------------------------------------
 * ORDER IS LOAD-BEARING, IN TWO DIRECTIONS AT ONCE
 *
 * `index` is ROW-MAJOR: it follows the order a reader's eye travels — sorted by
 * each tile's top edge, ties broken left to right. That is what makes 01 02 03
 * 04 land across the top row and gives the lightbox an arrow order that matches
 * the numbers on screen.
 *
 * But the array is ALSO the DOM order, and the DOM is built column by column,
 * so array order and visual order cannot both be row-major. The resolution is
 * that this array is in column-major order (which is what the DOM needs) while
 * `index` records the row-major position (which is what the reader sees).
 *
 * The two are reconciled by `GALLERY` below being sorted by `index`, and
 * `GALLERY_COLUMNS` grouping it by `column` for rendering. So the lightbox
 * walks `GALLERY` — 01, 02, 03 … — and lands on tiles in the order the numbers
 * promise, while the grid lays out down each column.
 *
 * ---------------------------------------------------------------------------
 * ADDING OR REMOVING A PHOTOGRAPH
 *
 * Both the column assignment and the indices have to be re-derived; neither can
 * be guessed. The recipe:
 *
 *   1. Measure the new file's ratio from its header, not by eye.
 *   2. Solve the partition — exhaustive if there are ≤ 14 tiles, otherwise
 *      shortest-column-first is within a few percent.
 *   3. Assign `index` by sorting all tiles by top edge (recomputing each
 *      column's running top), ties left to right.
 */

export type GalleryPhoto = {
  id: string;
  /** Row-major position, zero-padded. Shown on the caption and used by the lightbox. */
  index: string;
  /** Which column this tile sits in. The DOM is built column by column. */
  column: 0 | 1 | 2 | 3;
  /** Short caption, set under the photograph. */
  title: string;
  image: string;
  alt: string;
  /** width / height, measured from the source file. */
  aspect: number;
};

/**
 * Column-major — the order the DOM is built in.
 *
 * Sorted by `column`, then by each tile's position down that column.
 */
export const GALLERY: GalleryPhoto[] = [
  /* ------------------------------------------------------------- column 1 */
  {
    id: "pastry",
    index: "01",
    column: 0,
    title: "Morning Pastry",
    image: "/images/gallery/10.webp",
    alt: "A croissant dusted with sugar on a slate board, the sugar still falling through the air",
    aspect: 1.25,
  },
  {
    id: "sign",
    index: "08",
    column: 0,
    title: "The Sign",
    image: "/images/gallery/01.webp",
    alt: "A CAFE sign in round bulb lettering above a hand-written chalkboard price list",
    aspect: 0.6667,
  },
  {
    id: "pour-over",
    index: "12",
    column: 0,
    title: "The Morning Pour",
    image: "/images/gallery/07.webp",
    alt: "A gooseneck kettle pouring a thin stream of water over a paper filter in a glass dripper",
    aspect: 1.7778,
  },

  /* ------------------------------------------------------------- column 2 */
  {
    id: "workbench",
    index: "02",
    column: 1,
    title: "The Workbench",
    image: "/images/gallery/11.webp",
    alt: "Portafilters, ground coffee and a latte laid out on two wooden boards, seen from above",
    aspect: 1.5009,
  },
  {
    id: "espresso",
    index: "05",
    column: 1,
    title: "Espresso Neat",
    image: "/images/gallery/03.webp",
    alt: "An espresso in a fluted glass, sunlight and leaf shadows falling across the saucer",
    aspect: 1,
  },
  {
    id: "beans",
    index: "10",
    column: 1,
    title: "Fresh Roast",
    image: "/images/gallery/04.webp",
    alt: "Dark roasted coffee beans filling the frame, the oils still visible on the surface",
    aspect: 0.8,
  },

  /* ------------------------------------------------------------- column 3 */
  {
    id: "daylight",
    index: "03",
    column: 2,
    title: "Daylight Room",
    image: "/images/gallery/12.webp",
    alt: "A bright café interior with pendant lights, a plant, long wooden tables and people at the counter",
    aspect: 1.4585,
  },
  {
    id: "evening-room",
    index: "07",
    column: 2,
    title: "Evening Service",
    image: "/images/gallery/05.webp",
    alt: "The dining room set for the evening, with timber screens, banquette seating and pendant lights",
    aspect: 1.4995,
  },
  {
    id: "latte",
    index: "09",
    column: 2,
    title: "Latte Small",
    image: "/images/gallery/06.webp",
    alt: "A latte in a white cup with a heart poured into the foam, beans scattered on the table",
    aspect: 0.6667,
  },

  /* ------------------------------------------------------------- column 4 */
  {
    id: "counter",
    index: "04",
    column: 3,
    title: "The Counter",
    image: "/images/gallery/02.webp",
    alt: "The OASE counter mid-service: two grinders, an espresso machine and a row of pendant bulbs under a white brick wall",
    aspect: 1.4995,
  },
  {
    id: "from-above",
    index: "06",
    column: 3,
    title: "Black From Above",
    image: "/images/gallery/08.webp",
    alt: "A black coffee seen from directly above, the crema breaking into bubbles at the rim",
    aspect: 1,
  },
  {
    id: "menu-board",
    index: "11",
    column: 3,
    title: "Today's Board",
    image: "/images/gallery/09.webp",
    alt: "A letterboard coffee menu on a concrete wall, with a blue bicycle leaning below it",
    aspect: 0.8,
  },
];

/**
 * The four columns, in order — what the section actually renders.
 *
 * `GALLERY` is column-major already, so this only has to gather it; the split
 * exists so the component never has to know how the array is ordered.
 */
export const GALLERY_COLUMNS: GalleryPhoto[][] = [0, 1, 2, 3].map((column) =>
  GALLERY.filter((photo) => photo.column === column),
);

/**
 * Row-major order — what the reader sees, and the order the lightbox walks.
 *
 * Derived by sorting `index`, which is the row-major position. The lightbox
 * uses this rather than `GALLERY` so that arrowing right always lands on the
 * next number, whatever order the DOM was built in.
 */
export const GALLERY_READING_ORDER: GalleryPhoto[] = [...GALLERY].sort((a, b) =>
  a.index.localeCompare(b.index),
);
