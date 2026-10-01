"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { CATEGORIES, formatPrice, itemsFor, type MenuCategory } from "@/data/menu";
import { ringOffset, slotFor } from "@/lib/fanLayout";

/**
 * Menu.
 *
 * The reference presents this as a fan carousel: five cards visible in an arc
 * around the active one, rotated and scaled outwards, with the active card's
 * price and name revealed beneath it.
 *
 * It is NOT a card grid, and it is not a scroll rail. Geometry, the 4000ms
 * auto-advance and the 380ms transition are all measured from the reference.
 *
 * Three deliberate departures, each because the reference's version is not
 * usable as a menu:
 *
 *   1. The reference ships TWO identical fan decks. The first has no text at
 *      all; the second carries the price and name. Here one deck does both —
 *      the labels are the entire point of a menu.
 *   2. The reference has no keyboard access: the cards are `<div>`s with a
 *      click handler, so nothing can be reached by Tab and the deck is
 *      unusable without a pointer. The cards are real `<button>`s here.
 *   3. The reference auto-advances forever and does not stop on hover. That
 *      makes the price and name move while you are reading them, so the
 *      rotation pauses on hover and on focus, and is disabled outright under
 *      reduced motion.
 */

const AUTOPLAY_MS = 4000;

export default function Menu() {
  const [category, setCategory] = useState<MenuCategory>("drinks");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = itemsFor(category);
  const count = items.length;

  /* Reset to the first card when the category changes, so switching tabs
     cannot leave the deck pointing past the end of a shorter list. */
  const changeCategory = useCallback((next: MenuCategory) => {
    setCategory(next);
    setActive(0);
  }, []);

  const step = useCallback(
    (delta: number) => setActive((prev) => (prev + delta + count) % count),
    [count],
  );

  /* Autoplay. Paused on hover/focus, and skipped entirely when the user has
     asked for reduced motion — a carousel that moves on its own is exactly
     the kind of motion that preference is asking to be spared. */
  useEffect(() => {
    if (paused) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, step]);

  /* Arrow keys move the deck when focus is inside it. */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    },
    [step],
  );

  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="menu"
      data-theme="light"
      aria-labelledby="menu-heading"
      /* `overflow-x: clip` is load-bearing, not decoration.
         The fan is far wider than its box — outer cards reach +/-480px from
         centre and a parked card sits at +/-640px — so at 1280 the parked card
         lands 50px past the viewport edge and makes the whole document
         horizontally scrollable (measured: scrollWidth 1370 vs clientWidth
         1280, 90px of play).
         `clip` rather than `hidden`: it contains the bleed WITHOUT creating a
         scroll container, so nothing inside can scroll and no scrollbar
         appears. The reference does the same thing one level up, on its page
         root, which is why its own deck can stay `overflow: visible`. */
      /* `min-h-[var(--screen-h)]` with a flex column so the section fits exactly one
         viewport at 900px and above, and can still grow if a viewport is very
         short. `justify-center` distributes the slack evenly, which is what
         keeps the deck optically centred rather than pinned to the top.
         The reference has no such constraint — its two decks are separate
         900px sections, so the pacing problem never arises.
         `--screen-h` rather than `100svh` because the page is magnified on
         wide screens; a raw viewport unit would overshoot by the zoom. */
      className="themed relative flex min-h-[var(--screen-h)] flex-col justify-center overflow-x-clip bg-cream py-16"
    >
      <div className="shell flex flex-col items-center">
        <h2 id="menu-heading" className="display text-section text-center text-ink/70">
          OUR MENU
        </h2>

        {/* ------------------------------------------------------- category */}
        <div
          role="tablist"
          aria-label="Menu category"
          className="mt-7 flex items-center justify-center gap-2"
        >
          {CATEGORIES.map((c) => {
            const selected = c.id === category;
            return (
              <button
                key={c.id}
                role="tab"
                type="button"
                id={`menu-tab-${c.id}`}
                aria-selected={selected}
                aria-controls="menu-panel"
                onClick={() => changeCategory(c.id)}
                className={[
                  "label rounded-full px-5 py-3 transition-colors duration-300",
                  selected
                    ? "bg-ink text-cream"
                    : "bg-transparent text-ink/60 hover:text-ink",
                ].join(" ")}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------ deck */}
        <div
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`menu-tab-${category}`}
          ref={rootRef}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mt-10 flex flex-col items-center"
        >
          <div className="fan">
            {items.map((item, index) => {
              const offset = ringOffset(index, active, count);
              const slot = slotFor(offset, offset >= 0 ? 1 : -1);
              const isActive = offset === 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  data-fan-card
                  aria-label={`${item.name}, ${formatPrice(item.price)}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActive(index)}
                  className="fan-card"
                  style={{
                    transform: `translate(${slot.x}px, ${slot.y}px) scale(${slot.scale}) rotate(${slot.rotate}deg)`,
                    opacity: slot.opacity,
                    zIndex: slot.z,
                    /* Hidden cards must not be clickable or focusable —
                       otherwise Tab walks through five invisible cards. */
                    pointerEvents: slot.opacity === 0 ? "none" : "auto",
                  }}
                  /* `inert` on parked cards keeps them out of the tab order
                     without removing them from the DOM, which would restart
                     their transition on every change. */
                  inert={slot.opacity === 0}
                >
                  <span className="fan-card__frame">
                    <Image
                      src={item.image}
                      alt=""
                      width={200}
                      height={300}
                      sizes="200px"
                      priority={index < 3}
                      className="fan-card__img"
                    />
                  </span>

                  <span
                    className="fan-card__label"
                    style={{ opacity: isActive ? 1 : 0 }}
                    aria-hidden="true"
                  >
                    <span className="fan-card__price block">
                      {formatPrice(item.price)}
                    </span>
                    <span className="fan-card__name block">{item.name}</span>
                    <span className="fan-card__desc block">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------ controls */}
          <div className="z-30 mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => step(-1)}
              className="fan-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Menu item">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={item.name}
                  data-active={index === active}
                  onClick={() => setActive(index)}
                  className="fan-dot"
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next"
              onClick={() => step(1)}
              className="fan-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* The active item, for assistive tech. The visible label is inside
              the card and `aria-hidden`, so this is what gets announced when
              the deck moves. */}
          <p className="sr-only" aria-live="polite">
            {items[active].name} — {formatPrice(items[active].price)}
          </p>
        </div>
      </div>
    </section>
  );
}
