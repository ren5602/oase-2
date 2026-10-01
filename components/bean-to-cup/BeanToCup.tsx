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
 * The wheel owns its own scroll. It cancels the page scroll only while it
 * still has somewhere to go, so at either end the page continues normally —
 * which is why this section is NOT pinned by GSAP like Experience is. Two
 * scroll systems fighting over the same gesture would be worse than either.
 *
 * Photography and cutouts share one card size here, unlike the previous
 * layout. That is deliberate: the wheel's whole read depends on every card
 * being the same shape on the drum.
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
      data-theme="ink"
      aria-labelledby="b2c-heading"
      className="themed bg-coffee-dark"
    >
      {/* The wheel's own accessible name comes from its `label` prop, but a
          section still needs a real heading in the document outline. */}
      <h2 id="b2c-heading" className="sr-only">
        Bean to Cup
      </h2>

      <div className="h-[100svh] min-h-[36rem]">
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