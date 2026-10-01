/**
 * Bean to Cup.
 *
 * NOT in the reference. Original work in the language the other sections
 * established.
 *
 * Six stages, rendered as a turnable wheel: the stages are a fixed sequence the
 * reader moves through, and a drum expresses that better than a list — the
 * neighbours stay visible, so you can see where you have been and where you are
 * going, and the front card is the one being read.
 *
 * The assets are a mix of full-bleed photography and transparent cutouts. The
 * wheel gives every card the same size regardless, because its whole read
 * depends on the cards being uniform on the drum. The cutouts therefore sit on
 * the card's own dark ground rather than needing a special case.
 */

export type BeanStage = {
  id: string;
  /** Rendered as the stage numeral and in the wheel's index. */
  index: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const BEAN_STAGES: BeanStage[] = [
  {
    id: "origin",
    index: "01",
    title: "Origin",
    description:
      "Single-origin beans from a smallholder co-operative, grown at altitude and picked by hand.",
    image: "/images/bean-to-cup/origin.webp",
    alt: "A hessian sack brimming with dark roasted coffee beans",
  },
  {
    id: "selection",
    index: "02",
    title: "Selection",
    description:
      "Each lot is cupped before it earns a place. Anything flat or bitter goes back.",
    image: "/images/bean-to-cup/beans-small.webp",
    alt: "A small scatter of carefully chosen roasted coffee beans",
  },
  {
    id: "roasting",
    index: "03",
    title: "Roasting",
    description:
      "Small batches, watched by nose and ear. We stop just shy of the second crack.",
    image: "/images/bean-to-cup/beans-cutout.webp",
    alt: "Roasted coffee beans bursting outward, caught mid-air",
  },
  {
    id: "grinding",
    index: "04",
    title: "Grinding",
    description:
      "Ground to order, because the aroma starts leaving the moment the burrs stop.",
    image: "/images/bean-to-cup/grinding.webp",
    alt: "Two portafilters and a cup of coffee laid out on wooden boards",
  },
  {
    id: "brewing",
    index: "05",
    title: "Brewing",
    description:
      "Poured by hand, a little at a time. The bloom tells you whether it is right.",
    image: "/images/bean-to-cup/brewing.webp",
    alt: "Water being poured from a gooseneck kettle over a pour-over dripper",
  },
  {
    id: "cup",
    index: "06",
    title: "Cup",
    description: "And then it is simply yours. Best drunk standing at the bar.",
    image: "/images/bean-to-cup/cup.webp",
    alt: "A latte with a fern pattern in the crema, seen from directly above",
  },
];