import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import Navbar from "@/components/navbar/Navbar";
import { SITE } from "@/data/site";

import "./globals.css";

/* The reference sets all display type in Plus Jakarta Sans 700. Its own
   @font-face blocks load only 600 and 700; 500 is added here for body copy. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

/* The reference names Fraunces in its card-title CSS but never loads it, so it
   silently falls back to a generic serif. Loading it properly honours the
   intent. Confined to small accents — never headings. */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oase.cafe"),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#76453b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {/* Fixed chrome. Sits above every section and never scrolls. */}
        <Navbar />

        {/* NO `<main>` HERE, deliberately.
            A `<footer>` nested inside `<main>` does NOT receive the implicit
            `contentinfo` landmark role — the spec scopes `contentinfo` to a
            body-level element. So the page would have no footer landmark at
            all, and the skip link's `#main` target would be the only thing the
            wrapper was buying.

            The `<main>` therefore lives in `page.tsx`, around the sections and
            NOT around the footer, which is what lets `<Footer />` be a direct
            child of `<body>` and become a real landmark. Composition stays in
            `page.tsx`, which is where it already was. */}
        {children}
      </body>
    </html>
  );
}
