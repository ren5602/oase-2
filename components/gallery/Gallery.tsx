"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { GALLERY_COLUMNS, GALLERY_READING_ORDER } from "@/data/gallery";
import { EASE } from "@/lib/animations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Gallery.
 *
 * NOT in the reference. Original work in the language Hero, Signature and Menu
 * established.
 *
 * This is the one section that owns no scroll mechanism, and that is the design
 * rather than an omission. Signature pins a five-phase choreography, Menu is a
 * fan carousel, Experience a sticky horizontal strip and Bean to Cup a wheel —
 * four different ways of holding the reader still. Twelve photographs do not
 * need a fifth; they need to be shown. So the section simply flows.
 *
 * The layout is a masonry: uniform-width columns, heights following each
 * photograph's own proportions, a caption under every card. The mechanism is
 * CSS only — see `.gal-cols` / `.gal-col` in `globals.css` for why it needs no
 * viewport units and therefore survives the page zoom for free.
 *
 * `data-theme="ink"` — the page runs coffee -> cream -> cream -> ink -> cream,
 * and this puts the darkest ground after the lightest section. Photographs read
 * as luminous against it, the gutters become deliberate dark lines rather than
 * gaps, and it avoids a run of four light sections. Amber on ink measures
 * 7.50:1, the palette's strongest pairing.
 *
 * NOTE: this section also makes the `#gallery` entry in `SITE.nav` work for the
 * first time. The link has been in `data/site.ts` since the nav was built, but
 * nothing in the document carried that id, so it went nowhere.
 */
export default function Gallery() {
  const scope = useRef<HTMLElement>(null);

  /* `null` is closed. The index is a position in GALLERY_READING_ORDER — the
     row-major list — so arrowing moves to the next number on screen rather than
     the next tile in the DOM, which would jump around the grid. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* The tile that opened the lightbox, so focus can be handed back to it on
     close. Without this the reader is dropped at the top of the document and
     has to find their place again. */
  const lastTrigger = useRef<HTMLElement | null>(null);

  /* Set when the lightbox is dismissed, and acted on after the re-render below.
     `close()` cannot call `focus()` directly: the grid is still `inert` at that
     moment, and focusing into an inert subtree is silently ignored — measured,
     the focus stayed on `<body>`. Waiting a frame lets React drop the `inert`
     attribute first, so the tile is focusable again by the time we ask. */
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (openIndex !== null || !restoreFocus.current) return;
    restoreFocus.current = false;
    lastTrigger.current?.focus();
    lastTrigger.current = null;
  }, [openIndex]);

  const open = useCallback((readingIndex: number, trigger: HTMLElement) => {
    /* The trigger is passed in rather than read from `document.activeElement`.
       Reading it is the usual idiom, but it silently depends on the browser
       having focused the button by the time this runs — and it has not always:
       a programmatic `.click()` leaves `activeElement` on `<body>`, and the
       restore then has nothing to return to. Taking the element the handler
       already has removes the dependency entirely. */
    lastTrigger.current = trigger;
    setOpenIndex(readingIndex);
  }, []);

  const close = useCallback(() => {
    restoreFocus.current = true;
    setOpenIndex(null);
  }, []);

  const navigate = useCallback((delta: number) => {
    setOpenIndex((prev) => {
      if (prev === null) return prev;
      const n = GALLERY_READING_ORDER.length;
      // Wrap, so arrowing past either end continues rather than dead-ends.
      return (prev + delta + n) % n;
    });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* One reveal per column, staggered down its tiles. `once: true` rather
           than a toggle: the effect fires when a column's top reaches the
           viewport bottom, and re-running it on every scroll-back reads as a
           glitch rather than an entrance — the same reasoning as Signature's
           heading.

           Per COLUMN rather than per row, because a masonry has no rows — the
           tiles in a visual row belong to four different columns, so a
           row-based trigger would have to pick one arbitrarily and the reveal
           would fire at four different scroll positions anyway. */
        const columns = gsap.utils.toArray<HTMLElement>("[data-gal-col]");

        const tweens = columns.map((column) =>
          gsap.fromTo(
            column.querySelectorAll("[data-gal-tile]"),
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.09,
              ease: EASE.out,
              scrollTrigger: { trigger: column, start: "top bottom", once: true },
              /* Drop the inline `transform` the reveal leaves behind. GSAP
                 writes `translate(0px, 0px)` and keeps it, and an inline style
                 beats every stylesheet rule — so the tile would be permanently
                 unable to take a CSS transform. Harmless here, but it is a
                 silent trap for anything added later, and clearing it costs
                 nothing once the reveal has finished. */
              onComplete: () =>
                gsap.set(column.querySelectorAll("[data-gal-tile]"), {
                  clearProps: "transform",
                }),
            },
          ),
        );

        return () => {
          for (const tween of tweens) {
            tween.scrollTrigger?.kill();
            tween.kill();
          }
        };
      });

      /* Under reduced motion the tiles render in their final state, because the
         markup carries no start values — GSAP animates FROM an explicit state,
         so with no tween constructed there is nothing to undo. This branch
         exists only to make that explicit. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-gal-tile]", { clearProps: "all" });
      });

      return () => mm.revert();
    },
    { scope },
  );

  const isOpen = openIndex !== null;

  return (
    <section
      ref={scope}
      id="gallery"
      data-theme="ink"
      aria-labelledby="gallery-heading"
      className="themed relative bg-coffee-dark py-[var(--spacing-section)]"
    >
      <div className="shell mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="gallery-heading" className="display text-section text-cream">
          MOMENTS AT OASE
        </h2>
        <p className="label text-cream/50">
          {GALLERY_READING_ORDER.length} photographs
        </p>
      </div>

      {/* `inert` while the lightbox is open so Tab cannot walk into the grid
          behind the dialog. Applied to the grid rather than the section,
          because the lightbox is a sibling of this block, not a child. */}
      <div data-gal-grid inert={isOpen} className="gal-cols">
        {GALLERY_COLUMNS.map((column, columnIndex) => (
          <div key={columnIndex} data-gal-col className="gal-col">
            {column.map((photo) => (
              <figure key={photo.id} data-gal-tile className="gal-tile">
                <button
                  type="button"
                  /* The button carries no accessible name of its own; the
                     image inside it does, which is the standard pattern for an
                     image button and keeps the grid descriptive when read
                     linearly. */
                  onClick={(event) =>
                    open(
                      GALLERY_READING_ORDER.indexOf(photo),
                      event.currentTarget,
                    )
                  }
                  className="gal-tile__btn"
                >
                  <span
                    className="gal-frame"
                    style={{ "--gal-a": photo.aspect } as React.CSSProperties}
                  >
                    <Image
                      src={photo.image}
                      alt={photo.alt}
                      fill
                      /* Every tile is the same width in a masonry, so this is
                         one value rather than the per-tile share the justified
                         grid needed. `100vw - 13rem` is the content box: 2 x
                         the 56px gutter plus 3 x the 24px gap at the widest,
                         rounded up so the browser never under-requests. */
                      sizes="calc((100vw - 13rem) / 4)"
                      quality={85}
                      className="gal-tile__img"
                    />

                    {/* Enlarge affordance, matching the wheel card's chip: dark
                        over the photograph, not themed, because it sits on the
                        image rather than on the section's ground. */}
                    <span className="gal-tile__zoom" aria-hidden="true">
                      <svg
                        viewBox="0 0 16 16"
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        focusable="false"
                      >
                        <path d="M6.2 9.8 9.8 6.2M7 2h7v7M9 14H2V7" />
                      </svg>
                    </span>
                  </span>
                </button>

                {/* Outside the button deliberately: a caption is not part of
                    the control's name, and nesting it would make the button's
                    accessible name the title plus the alt text. */}
                <figcaption className="gal-cap" aria-hidden="true">
                  <span className="gal-cap__title">{photo.title}</span>
                  <span className="gal-cap__index">{photo.index}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>

      <GalleryLightbox
        photos={GALLERY_READING_ORDER}
        index={openIndex}
        onClose={close}
        onNavigate={navigate}
      />
    </section>
  );
}
