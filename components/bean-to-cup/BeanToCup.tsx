"use client";

import { BEAN_STAGES } from "@/data/beanToCup";
import { WorksWheel } from "@/components/ui/works-wheel";

/**
 * Bean to Cup — the six stages as a turnable wheel.
 *
 * The section is a wheel rather than a pinned vertical progression. The stages
 * are a fixed sequence the reader moves THROUGH, and a wheel expresses that
 * better than a scroll-jacked list: the drum gives the sequence a physical
 * order, the neighbours stay visible so you can see where you have been and
 * where you are going, and the front card is the one being read.
 *
 * The wheel owns its own scroll. It takes a gesture only while it still has
 * somewhere to go AND only once it fills the frame — so while the reader is
 * still arriving, and again at either end, the page scrolls normally. Two
 * scroll systems fighting over the same gesture would be worse than either.
 *
 * LIGHT GROUND, deliberately, and it is the only light section after a run of
 * dark ones. The wheel's six cards are its subject, and they carry their own
 * ground via `.wheel-card`, so the section behind them does not have to be dark
 * for them to read — while the cream keeps the drum's hard perspective from
 * disappearing into a dark page.
 *
 * What it is NOT is a white-on-white section: three of the six stages are
 * photographs whose mean luminance measures 0.04-0.07, and the cutouts need a
 * dark plate to separate at all (the bean stages read 1.97:1 against the brown
 * plate the wheel shipped with, which is why the plate is `--color-coffee-dark`
 * — 4.30:1). So the drum stays a dark object on a light page, which is also
 * what keeps the cup — a white cup — from vanishing.
 */

const WHEEL_ITEMS = BEAN_STAGES.map((stage) => ({
  title: stage.title,
  image: stage.image,
  index: stage.index,
  description: stage.description,
  alt: stage.alt,
}));

export default function BeanToCup() {
  return (
    <section
      id="bean-to-cup"
      data-theme="light"
      aria-labelledby="b2c-heading"
      className="themed bg-cream"
    >
      {/* The wheel's own accessible name comes from its `label` prop, but a
          section still needs a real heading in the document outline. */}
      <h2 id="b2c-heading" className="sr-only">
        Bean to Cup
      </h2>

      {/* `--screen-h` rather than `100svh`: the page is magnified above 1536
          and a raw viewport unit would overshoot by the zoom factor, leaving
          the section taller than the screen it is supposed to fill. */}
      <div className="h-[var(--screen-h)] min-h-[36rem]">
        <WorksWheel
          items={WHEEL_ITEMS}
          label="Bean to Cup"
          /* No `action`: these cards are not links, they are stages. An
             affordance promising navigation would be a lie. */
        />
      </div>
    </section>
  );
}