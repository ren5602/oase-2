/**
 * Experience.
 *
 * NOT in the reference. The Framer build covers Hero, Signature and Menu only,
 * so this section is original work in the language those three established:
 * dark ground, display type in Plus Jakarta Sans 700, Fraunces for small
 * accents, amber `#e39f01` as the single accent.
 *
 * The five entries are the brief's, and they describe an arc through a day —
 * which is why they are ordered as a timeline and why the section is a strip
 * that travels rather than a set of cards.
 *
 * `aspect` is each photograph's true ratio, measured from the files. The strip
 * sizes every image to the same HEIGHT and lets the width follow from the
 * ratio, so the rhythm of narrow and wide panels is the photographs' own
 * rather than an arbitrary grid. That is what makes it read as an editorial
 * strip instead of a carousel.
 */

export type ExperiencePanel = {
  id: string;
  /** Rendered as the panel's numeral. Zero-padded, so `"01"`. */
  index: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  /** width / height, from the source file. */
  aspect: number;
};

export const EXPERIENCE: ExperiencePanel[] = [
  {
    id: "slow-mornings",
    index: "01",
    title: "Slow Mornings",
    description: "Doors at seven. The first pour is the quietest.",
    image: "/images/experience/slow-mornings.webp",
    alt: "Three cups of coffee held together over a table, seen from above",
    aspect: 0.75,
  },
  {
    id: "coffee-conversations",
    index: "02",
    title: "Coffee Conversations",
    description: "Two cups, one table, no rush.",
    image: "/images/experience/coffee-conversations.webp",
    alt: "The OASE room mid-morning, tables full and the counter busy",
    aspect: 1.3333,
  },
  {
    id: "work-and-create",
    index: "03",
    title: "Work & Create",
    description: "Long tables, good light, refills when you need them.",
    image: "/images/experience/work-and-create.webp",
    alt: "An open laptop and a mug on a sunlit wooden table by a window",
    aspect: 0.75,
  },
  {
    id: "afternoon-pause",
    index: "04",
    title: "Afternoon Pause",
    description: "Something warm between one thing and the next.",
    image: "/images/experience/afternoon-pause.webp",
    alt: "Three loaves of seeded bread cooling on a floured surface",
    aspect: 1,
  },
  {
    id: "evening-gatherings",
    index: "05",
    title: "Evening Gatherings",
    description: "The lights come down, the room fills up.",
    image: "/images/experience/evening-gatherings.webp",
    alt: "A laid table in the evening, glasses poured and plates served",
    aspect: 0.8,
  },
];
