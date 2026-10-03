/**
 * CTA — the closing section.
 *
 * NOT in the reference. The Framer build covers Hero, Signature and Menu only,
 * so this is original work in the language those three established.
 *
 * ---------------------------------------------------------------------------
 * WHAT WAS ADAPTED FROM THE DESIGN REFERENCE, AND WHAT WAS NOT
 *
 * The layout reference is a two-column closing panel: a text block on the left,
 * two overlapping rounded cards on the right, a soft warm gradient behind the
 * whole thing.
 *
 * Kept, because it is the composition:
 *
 *   - the split, with the cluster larger than the text block
 *   - two cards, the front one overlapping the back one's lower-right corner
 *   - both cards rounded, with the front one elevated over the back
 *   - the warm, low-contrast ground
 *
 * Changed, because the reference contradicts this page:
 *
 *   - HEADLINE. The reference sets a sentence-case serif. Every heading on this
 *     page is uppercase Plus Jakarta Sans 700 at `--text-section`, so the copy
 *     is adapted to that voice rather than importing a second one — Fraunces is
 *     an accent face here and never a heading.
 *   - BUTTON. The reference uses a dark rounded pill. This page already has a
 *     button shape — the nav pill's chamfer, extracted as `ChamferButton` — so
 *     the CTA reuses it and the two buttons read as one system.
 *   - CARDS. The reference uses two oil paintings. These are two photographs of
 *     this café, which is what every other section shows.
 *
 * ---------------------------------------------------------------------------
 * THE COPY IS A PLACEHOLDER, AND SO IS THE DESTINATION
 *
 * The reference has no CTA copy of its own and no address to link to. The
 * headline and body below are written to the brand's voice; `SITE.visit.maps`
 * is built from the placeholder Jakarta address in `data/site.ts` and must be
 * replaced before launch, along with everything else under `SITE.visit`.
 *
 * ---------------------------------------------------------------------------
 * WHY THE TWO PHOTOGRAPHS ARE NEW
 *
 * Every other photograph on the page is already spoken for: twelve in the
 * Gallery immediately above this section, five in Experience, four in
 * Signature, twelve in Menu. Reusing any of them would repeat an image within
 * one scroll of itself.
 *
 * So two were added, chosen to ADD subjects rather than restate them. Between
 * them the existing set covers the counter, espresso, beans, pour-over, the
 * sign, two rooms, latte, an overhead cup, a menu board, pastry, the workbench,
 * a bright room and an evening room. What it does not have is a reading corner
 * or a cup in someone's hands — so those are the two.
 *
 * Both were inspected as files before being chosen, not selected on their
 * descriptions. The Gallery's first photo pick passed every ratio and balance
 * check while being two near-duplicates of existing tiles; only looking caught
 * it. Two of the first candidates here failed the same way — one was literally
 * the photograph already used as `gallery/12.webp`.
 *
 * ---------------------------------------------------------------------------
 * THE CROPS ARE PART OF THE ASSETS
 *
 * Both files are stored ALREADY CROPPED to the box they render in, so the
 * browser never has to decide what to cut:
 *
 *   reading-room.webp   1200 x 1538   ratio 0.7802   back card  (0.78)
 *   in-hand.webp         700 x  684   ratio 1.0234   front card (1.024)
 *
 * The back card is the reference's own proportion (413 x 528 inside its 529
 * square cluster); the front is 226 x 222. Cropping at build time rather than
 * with `object-position` also means the subject is placed deliberately — the
 * cup sits low in its frame because the card's lower-right corner is the part
 * that overlaps the back card and would otherwise hide it.
 */

export type CtaCard = {
  id: string;
  image: string;
  alt: string;
  /** Rendered width, for `sizes`. See the note in `Cta.tsx`. */
  sizes: string;
};

export const CTA = {
  /**
   * No terminal punctuation, deliberately. Every other heading on the page is
   * a bare statement — "TASTE OUR SIGNATURE", "OUR MENU", "MOMENTS AT OASE" —
   * and Plus Jakarta's period carries a wide sidebearing at 64px, so a full
   * stop here read as a detached dot rather than a full stop.
   */
  heading: "FIND YOUR OASIS",
  body:
    "Two minutes from the main road — slow coffee, honest food, and a table that stays yours.",
  /**
   * The primary action. `external` because a maps link leaves the site.
   *
   * "Get directions" rather than the overlay's "Visit OASE": the overlay's
   * button is a navigation affordance that brings you HERE, so a second button
   * saying the same thing would be asking a question it had already answered.
   * What a reader wants at the foot of the page is the practical next step.
   */
  primary: { label: "Get directions", external: true },
  /** The secondary action, pointing back up the page. */
  secondary: { label: "See the menu", href: "#menu" },
} as const;

/**
 * The two cards. Back first — it is painted first, and the front card overlaps
 * it, which is the reference's stacking.
 */
export const CTA_CARDS: CtaCard[] = [
  {
    id: "reading-room",
    image: "/images/cta/reading-room.webp",
    alt: "The reading corner at OASE: stacked books, teapots and patterned floor tiles under a warm pendant light",
    sizes: "530px",
  },
  {
    id: "in-hand",
    image: "/images/cta/in-hand.webp",
    alt: "A latte in a handmade ceramic cup, held in two hands against a warm patterned floor",
    sizes: "300px",
  },
];
