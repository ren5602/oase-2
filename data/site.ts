/**
 * Site content.
 *
 * The reference build contains NO footer, no address, no opening hours, no
 * phone, no email and no social handles — it is a five-section scroll demo.
 * Everything under `visit` is therefore placeholder copy and must be replaced
 * before launch.
 */

export type NavLink = {
  /** Matches the section's DOM `id`, used for the anchor href. */
  id: string;
  label: string;
};

export type SiteInfo = {
  name: string;
  tagline: string;
  description: string;
  /** The line printed on the reference cup, reused as the brand statement. */
  statement: string;
  nav: NavLink[];
  visit: {
    addressLines: string[];
    /**
     * A maps link, built from the placeholder address below.
     *
     * Kept as a field rather than derived in the component, so that swapping
     * the placeholder address for the real one is a single edit here instead of
     * a search for every place the address is printed.
     */
    maps: string;
    hours: { days: string; time: string }[];
    instagram: { handle: string; url: string };
    email: string;
    phone: { label: string; href: string };
  };
};

export const SITE: SiteInfo = {
  name: "OASE",
  tagline: "Coffee & Calm",
  description:
    "OASE is a modern café and a small oasis in the middle of a busy day — slow coffee, honest food, and room to breathe.",
  statement: "Your little oasis in the rush of the day",

  /* Order matches the reference's own section order, so the nav reads as a
     table of contents for the page. */
  nav: [
    { id: "home", label: "Home" },
    { id: "signature", label: "Signature" },
    { id: "menu", label: "Menu" },
    { id: "experience", label: "Experience" },
    { id: "gallery", label: "Gallery" },
  ],

  /* PLACEHOLDER — none of this exists in the reference. */
  visit: {
    addressLines: ["Jl. Senopati No. 24", "Kebayoran Baru", "Jakarta 12190"],
    maps: "https://www.google.com/maps/search/?api=1&query=Jl.%20Senopati%20No.%2024%2C%20Kebayoran%20Baru%2C%20Jakarta%2012190",
    hours: [
      { days: "Mon – Thu", time: "07.00 – 22.00" },
      { days: "Fri – Sat", time: "07.00 – 24.00" },
      { days: "Sunday", time: "08.00 – 22.00" },
    ],
    instagram: { handle: "@oase.cafe", url: "https://instagram.com" },
    email: "hello@oase.cafe",
    phone: { label: "+62 21 5555 0199", href: "tel:+622155550199" },
  },
};
