/**
 * Menu content.
 *
 * Item names and prices are the reference's own, verbatim:
 *
 *   $6 Coffee Latte · $5 Pure Matcha · $5 Fresh Lemon
 *   $4 Black Tea   · $5 Melon Juice · $6 Lychee Tea
 *
 * Descriptions are also the reference's, but with the spelling corrected —
 * it ships "smoth blend coffe", "zamn its good" and "Taste nature flavour",
 * which read as mistakes rather than voice. Names, order and prices are
 * untouched.
 *
 * The reference presents these as two separate fan carousels: the first has
 * no text at all (images only), the second is the one that carries price and
 * name. They are combined here into one deck that does both, because the
 * reference's first deck is a duplicate of the same six photographs and the
 * labels are the whole point of a menu.
 */

export type MenuCategory = "drinks" | "foods";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Whole units, rendered with the site's currency prefix. */
  price: number;
  image: string;
  alt: string;
  category: MenuCategory;
};

export const MENU: MenuItem[] = [
  /* ------------------------------------------------------------- drinks */
  {
    id: "coffee-latte",
    name: "Coffee Latte",
    description: "Smooth blend, silky milk",
    price: 6,
    image: "/images/menu/drink-coffee-latte.webp",
    alt: "A latte in an OASE cup, milk swirling into the crema",
    category: "drinks",
  },
  {
    id: "pure-matcha",
    name: "Pure Matcha",
    description: "Stone-ground, whisked to order",
    price: 5,
    image: "/images/menu/drink-pure-matcha.webp",
    alt: "An OASE cup of vivid green matcha surrounded by fresh leaves",
    category: "drinks",
  },
  {
    id: "fresh-lemon",
    name: "Fresh Lemon",
    description: "Pressed cold, nothing added",
    price: 5,
    image: "/images/menu/drink-fresh-lemon.webp",
    alt: "An OASE cup of lemon tea with a citrus splash",
    category: "drinks",
  },
  {
    id: "black-tea",
    name: "Black Tea",
    description: "Brewed strong, served clean",
    price: 4,
    image: "/images/menu/drink-black-tea.webp",
    alt: "An OASE cup of black tea with a deep amber splash",
    category: "drinks",
  },
  {
    id: "melon-juice",
    name: "Melon Juice",
    description: "Ripe melon, blended fresh",
    price: 5,
    image: "/images/menu/drink-melon-juice.webp",
    alt: "An OASE cup of melon juice with a green splash",
    category: "drinks",
  },
  {
    id: "lychee-tea",
    name: "Lychee Tea",
    description: "Floral, sweet, lightly iced",
    price: 6,
    image: "/images/menu/drink-lychee-tea.webp",
    alt: "An OASE cup of lychee tea with fruit and ice",
    category: "drinks",
  },

  /* -------------------------------------------------------------- foods */
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    description: "Laminated overnight, baked at six",
    price: 5,
    image: "/images/menu/food-butter-croissant.webp",
    alt: "A flaky butter croissant on a plate",
    category: "foods",
  },
  {
    id: "chicken-sandwich",
    name: "Chicken Sandwich",
    description: "Toasted club, house aioli",
    price: 8,
    image: "/images/menu/food-chicken-sandwich.webp",
    alt: "A toasted club sandwich with fries on a wooden board",
    category: "foods",
  },
  {
    id: "garden-salad",
    name: "Garden Salad",
    description: "Leaves, herbs, lemon dressing",
    price: 7,
    image: "/images/menu/food-garden-salad.webp",
    alt: "A bowl of garden salad with fresh greens",
    category: "foods",
  },
  {
    id: "pesto-pasta",
    name: "Pesto Pasta",
    description: "Basil pounded by hand",
    price: 8,
    image: "/images/menu/food-pesto-pasta.webp",
    alt: "A bowl of pasta tossed in green pesto",
    category: "foods",
  },
  {
    id: "signature-pizza",
    name: "Signature Pizza",
    description: "Wood-fired, blistered crust",
    price: 9,
    image: "/images/menu/food-signature-pizza.webp",
    alt: "A wood-fired pizza topped with basil and mozzarella",
    category: "foods",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Espresso-soaked, made daily",
    price: 7,
    image: "/images/menu/food-tiramisu.webp",
    alt: "A slice of tiramisu dusted with cocoa",
    category: "foods",
  },
];

export const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: "drinks", label: "Drinks" },
  { id: "foods", label: "Foods" },
];

export function itemsFor(category: MenuCategory): MenuItem[] {
  return MENU.filter((item) => item.category === category);
}

/** Prices are the reference's own dollar figures, so they render as `$6`. */
export function formatPrice(value: number): string {
  return `$${value}`;
}
