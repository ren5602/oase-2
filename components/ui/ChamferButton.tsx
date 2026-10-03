import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The chamfered plate, as a link.
 *
 * The shape is the nav pill's own silhouette — 4px radius at the top two
 * corners, a square bottom-right, and a chamfered bottom-left — reused as the
 * site's button. The path is the reference's, scaled from the pill's 80x44 to a
 * 200x56 button box.
 *
 * It is an SVG rather than `clip-path` for one accessibility reason: a
 * clip-path clips the element's own rendering, which includes the
 * `:focus-visible` outline, so the focus ring would be sliced off along the
 * chamfered edge. Painting the shape as a child leaves the anchor's box — and
 * therefore its outline — intact.
 *
 * ---------------------------------------------------------------------------
 * THE PLATE COLOURS ARE A PROP, NOT A DEFAULT, AND THAT IS THE POINT
 *
 * The button ships on two different grounds and the same fill cannot serve
 * both. The overlay's plate is `amber`, which is right on coffee-dark (7.50:1)
 * and wrong on cream: measured, `--color-amber` on `--color-cream` is
 * **2.25:1**, under the 3:1 that WCAG 1.4.11 asks of a component boundary. Its
 * hover brightens to cream, which on a cream section makes the plate disappear
 * entirely.
 *
 * So the caller names both fills. The defaults are the overlay's, since that is
 * where the button was extracted from; the CTA passes the light-ground pair.
 *
 * ---------------------------------------------------------------------------
 * THE ONE APPROXIMATION, STATED PLAINLY
 *
 * `preserveAspectRatio="none"` lets the plate stretch to any width, which means
 * the chamfer's horizontal extent scales with the button: exact at 200px wide,
 * off by `(1 - w/200) * 11.216px` otherwise. Over the widths this is used at
 * (148px in the overlay, ~180px in the CTA) that is a sub-pixel to ~1px
 * difference on an 11px detail, and both call sites share this component, so
 * the two buttons cannot drift apart in any other way.
 *
 * A fixed-width plate would fix the chamfer and break the button, since the
 * label length is what sets the width.
 */

/** The reference's pill path, re-drawn on a 200x56 box. */
const PLATE_PATH =
  "M 200 4 C 200 1.791 198.209 0 196 0 L 4 0 C 1.791 0 0 1.791 0 4 " +
  "L 0 37 L 11.216 54.186 C 11.955 55.318 13.215 56 14.566 56 L 200 56 Z";

type ChamferButtonProps = {
  href: string;
  children: ReactNode;
  /** Passed straight to the anchor — used by the overlay's Tab trap. */
  "data-nav-focus"?: boolean;
  onClick?: () => void;
  /** Opens in a new tab, with the `rel` that requires. */
  external?: boolean;
  /** Rest + hover fills for the plate. See the note above. */
  plateClassName?: string;
  /** Label colour. */
  labelClassName?: string;
  className?: string;
};

export default function ChamferButton({
  href,
  children,
  onClick,
  external = false,
  plateClassName = "fill-amber group-hover:fill-cream",
  labelClassName = "text-ink",
  className,
  ...rest
}: ChamferButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
      className={cn(
        "press group relative inline-flex h-14 items-center justify-center px-9",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 56"
        /* Non-uniform on purpose — see the note above. */
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={PLATE_PATH}
          className={cn(
            "transition-colors duration-300",
            plateClassName,
          )}
        />
      </svg>

      <span className={cn("display relative text-sm", labelClassName)}>
        {children}
      </span>
    </a>
  );
}
