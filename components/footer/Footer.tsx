import { SITE } from "@/data/site";

/**
 * Footer — the last section, and the page's closing statement.
 *
 * NOT in the reference, and this one is worth stating precisely: the Framer
 * build has **no `<footer>`, no `<nav>`, no `<a>` in its page content, and no
 * address, hours, phone, email, social handle, copyright line or legal text
 * anywhere in the document**. It ends after its second fan carousel and simply
 * stops. So this is original work in the language the rest of the page
 * established.
 *
 * ---------------------------------------------------------------------------
 * WHAT JUSTIFIES IT: TWO FIELDS THAT HAVE BEEN DEAD SINCE THE NAV WAS BUILT
 *
 * `SITE.visit` has carried three opening-hours rows and a phone number since
 * the very first commit. Auditing what actually renders them:
 *
 *   addressLines   the overlay, and the CTA's maps link
 *   maps           the CTA's primary button
 *   hours[0]       the overlay, one row only
 *   hours[1]       NOWHERE
 *   hours[2]       NOWHERE
 *   phone          NOWHERE
 *
 * So the footer is not decoration. It is where the full hours table and the
 * phone number finally reach the page, and that is its reason to exist.
 *
 * ---------------------------------------------------------------------------
 * `data-theme="ink"`, AND WHY NOT `dark`
 *
 * `dark` is the Hero's ground — `--color-coffee`. It would be the obvious
 * choice as a bookend, and it is the wrong one for two measured reasons:
 *
 *   1. CONTRAST. On coffee, `--section-accent` (amber) measures **3.44:1**,
 *      which the design system documents as "large text only". A footer is
 *      small text and links. On `ink` the same accent measures **7.50:1**.
 *   2. THE HERO OWNS COFFEE. It is the one place that colour appears. Reusing
 *      it at the other end of the page dilutes the hero rather than bookending
 *      it — and coffee -> cream -> … -> cream -> coffee would read as a
 *      symmetric frame the rest of the page does not actually have.
 *
 * Ink also pairs with the Gallery, so the page's two darkest moments are the
 * same colour, and the nav pill inverts to its light treatment at the bottom.
 *
 * ---------------------------------------------------------------------------
 * WHY IT IS A SERVER COMPONENT
 *
 * No `"use client"`, no `useGSAP`, no hooks — and that is the design, not an
 * omission. Every other section on this page owns some piece of choreography,
 * and the footer should own none: the reader has finished. The links carry
 * hover and focus transitions in CSS, which needs no JavaScript at all, and
 * back-to-top is a plain anchor.
 *
 * It also means this section renders with zero client JS, which is the right
 * shape for the one block on the page that is pure information.
 */
export default function Footer() {
  /* Baked in at build time, which is correct for a build-and-deploy site: the
     year is a fact about the build, not about the moment the page is opened.
     A client-side `new Date()` would make the footer's text change while the
     page is open, and would force this component to become a client one. */
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      data-theme="ink"
      aria-labelledby="footer-heading"
      className="themed foot"
    >
      <div className="shell foot__inner">
        {/* The footer needs an accessible name, and `aria-labelledby` pointing
            at a real heading is the honest way to give it one. Visually hidden
            because a visible "Footer" label would be noise — but present in the
            outline, so the landmark is navigable by name. */}
        <h2 id="footer-heading" className="sr-only">
          OASE — visit and contact
        </h2>

        <div className="foot__grid">
          {/* ------------------------------------------------------- brand */}
          <div className="foot__brand">
            {/* The wordmark is TYPE, not an image. The reference's "OASE"
                exists only inside a raster cup graphic — there is no text
                version of it in the document at all — so this follows the
                Navbar, which also sets it in Plus Jakarta Sans 700 with
                `0.34em` tracking. Reusing that tracking is what makes the two
                read as the same mark. */}
            <p className="foot__wordmark display">{SITE.name}</p>

            {/* Fraunces, which is the accent face and never a heading — the
                same role it plays in the overlay. */}
            <p className="foot__tagline serif">{SITE.tagline}</p>

            {/* `SITE.statement` is the line printed on the reference cup. It has
                been reachable since the nav was built, but only from the overlay
                and the hero's screen-reader text — so this is the first time it
                is visible on the page proper. */}
            <p className="foot__statement">{SITE.statement}</p>
          </div>

          {/* ------------------------------------------------------- hours
              A real `<dl>`, because that is exactly what this is: three terms
              and three definitions. Marking it up as two paragraphs of text
              with a separator would lose the pairing for anyone using a screen
              reader, which is the entire content of the block.

              ALL THREE ROWS, which is the point — the overlay only ever shows
              `hours[0]`. */}
          <div className="foot__col">
            <h3 className="foot__label label">Hours</h3>
            <dl className="foot__hours">
              {SITE.visit.hours.map((row) => (
                <div key={row.days} className="foot__hours-row">
                  <dt>{row.days}</dt>
                  <dd>{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ------------------------------------------------------- visit
              `<address>` is the correct element and carries `not-italic` — the
              browser default italic would be wrong for a street address in a
              column of otherwise upright text.

              The address is a LINK to the same maps destination the CTA's
              button uses, but as quiet body text rather than a second button:
              "Get directions" is ~400px above this and repeating the button
              would be noise, while an unclickable address is a missed
              affordance. */}
          <div className="foot__col">
            <h3 className="foot__label label">Visit</h3>
            <address className="foot__address not-italic">
              <a
                href={SITE.visit.maps}
                target="_blank"
                rel="noreferrer noopener"
                className="foot__link foot__link--block"
              >
                {SITE.visit.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </a>
            </address>
          </div>

          {/* ----------------------------------------------------- contact */}
          <div className="foot__col">
            <h3 className="foot__label label">Contact</h3>
            <ul className="foot__list">
              {/* `tel:` and `mailto:` are real schemes, so these are links
                  rather than text. The phone is rendered in its own label form
                  (`+62 21 …`) while the href is E.164 with no spaces, because
                  dialers want the machine-readable version. */}
              <li>
                <a href={SITE.visit.phone.href} className="foot__link">
                  {SITE.visit.phone.label}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.visit.email}`} className="foot__link">
                  {SITE.visit.email}
                </a>
              </li>
              <li>
                {/* External, so it needs the `rel` that goes with `target`. */}
                <a
                  href={SITE.visit.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="foot__link"
                >
                  {SITE.visit.instagram.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------------ bottom bar
            `mt-auto` on the inner flex column is what pins this to the floor of
            the section regardless of how tall the columns above are. */}
        <div className="foot__bar">
          <p className="foot__legal">
            &copy; {year} {SITE.name}
          </p>

          {/* The nav links, repeated.

              The overlay is long closed by the time a reader reaches the
              bottom, so without this the page's only navigation is invisible
              from here. It is deliberately the SAME `SITE.nav` array the
              overlay renders — not a second hand-written list — so the two can
              never drift out of sync, and adding a section later updates both. */}
          <nav aria-label="Footer" className="foot__nav">
            <ul className="foot__nav-list">
              {SITE.nav.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="foot__nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Back to top.

              An ANCHOR, not a scroll handler: `#home` is the Hero's id, and the
              page sets `scroll-behavior: smooth` on the root. The global
              reduced-motion block already forces `scroll-behavior: auto
              !important`, so this degrades to an instant jump for free — which
              is exactly the behaviour that preference asks for, and it costs no
              JavaScript to get there.

              It mirrors the Hero's "scroll down" cue at the opposite end of the
              page: the same gesture, pointing the other way. The arrow is that
              cue's own chevron, rotated 180 degrees. */}
          <a href="#home" className="foot__top">
            Back to top
            <span className="foot__top-arrow" aria-hidden="true">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                focusable="false"
              >
                <path
                  d="M0.682843 7.75391C0.430857 7.50192 0.609324 7.07107 0.965685 7.07107H7.07107H13.1765C13.5328 7.07107 13.7113 7.50192 13.4593 7.75391L7.35391 13.8593C7.1977 14.0155 6.94443 14.0155 6.78823 13.8593L0.682843 7.75391Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
