"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { GalleryPhoto } from "@/data/gallery";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

/**
 * Gallery lightbox.
 *
 * A dialog over the grid, showing one photograph as large as it goes without
 * upscaling. Split out from `Gallery` for the same reason `NavOverlay` is split
 * out from `Navbar`: the trigger belongs to the section, the dialog does not,
 * and keeping them apart stops the section's markup from being buried under
 * dialog concerns.
 *
 * The interaction contract is small but it is all load-bearing:
 *
 *   Escape            closes
 *   ArrowLeft/Right   moves through the photographs, wrapping at either end
 *   click the scrim   closes (clicking the photograph itself does not)
 *   Tab               trapped, so focus cannot reach the grid behind
 *   on close          focus returns to the tile that opened it
 *
 * The scroll lock is the shared `lib/scrollLock`, which is reference-counted —
 * so if the nav overlay is somehow also open, the two cannot unlock each
 * other's scroll.
 *
 * The photograph list is passed in rather than imported. The grid renders
 * column by column but numbers its tiles row by row, so the order the arrows
 * should walk is not the order the data file is stored in — it is
 * `GALLERY_READING_ORDER`. Taking the list as a prop keeps that decision in one
 * place and stops this component from having to know how the grid is laid out.
 */

type GalleryLightboxProps = {
  /** The photographs, in the order the arrows should walk them. */
  photos: GalleryPhoto[];
  /** Index into `photos`, or `null` when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
};

export default function GalleryLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const open = index !== null;

  /* Lock the page behind the dialog. Restored on close, and on unmount so a
     hot reload cannot leave the document frozen. */
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  /* Keyboard: Escape to close, arrows to move. Bound to the document rather
     than to the dialog, because focus is inside the dialog but the reader may
     not have tabbed anywhere yet. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate(1);
      } else if (event.key === "Tab") {
        /* Trap. The dialog has only its own controls in it, so the cycle is
           short — but without this, Tab walks into the page behind and the
           reader loses the dialog entirely. */
        const panel = panelRef.current;
        if (!panel) return;

        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>("button:not([disabled])"),
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !panel.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onNavigate]);

  /* Move focus into the dialog when it opens, so the keyboard is not left on
     the tile behind it. The close button is the natural landing place: it is
     the control that is always present. */
  useEffect(() => {
    if (!open) return;
    const close = panelRef.current?.querySelector<HTMLElement>("[data-lb-close]");
    close?.focus();
  }, [open]);

  if (index === null) return null;

  const photo = photos[index];
  /* The numerator is the tile's OWN numeral rather than `index + 1`. The list
     is in reading order, so the two happen to agree — but taking the numeral
     from the photograph means the counter can never disagree with the number
     printed under the tile on the grid, whatever order the list is given in. */
  const position = photo.index;
  const total = String(photos.length).padStart(2, "0");

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.alt} — photograph ${position} of ${total}`}
      className="lb"
      /* Click the backdrop to dismiss, but not the photograph. Comparing the
         target to the currentTarget is what distinguishes the two: a click on
         the image bubbles up to this handler with a different target. */
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* The photograph. `key` on the src so React remounts the <Image> when the
          reader navigates — without it the element is reused and the browser
          keeps showing the previous photograph until the new one decodes. */}
      <Image
        key={photo.id}
        src={photo.image}
        alt={photo.alt}
        width={1600}
        height={Math.round(1600 / photo.aspect)}
        sizes="1280px"
        quality={90}
        priority
        className="lb__img"
        onClick={(event) => event.stopPropagation()}
      />

      {/* ---------------------------------------------------------- controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <p className="label pointer-events-auto text-cream/70">
          {position} / {total}
        </p>

        <button
          type="button"
          data-lb-close
          onClick={onClose}
          aria-label="Close"
          className="lb__btn press pointer-events-auto"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center p-6">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          aria-label="Previous photograph"
          className="lb__btn press"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center p-6">
        <button
          type="button"
          onClick={() => onNavigate(1)}
          aria-label="Next photograph"
          className="lb__btn press"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
