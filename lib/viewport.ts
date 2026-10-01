/**
 * Page zoom, and the layout viewport.
 *
 * The page magnifies itself above 1536 device px via `zoom` on the root element
 * (see the PAGE ZOOM block in `globals.css`), which means the DOM now contains
 * two different coordinate systems at once:
 *
 *   LAYOUT px   what the document is laid out in. `clientWidth`,
 *               `scrollWidth`, `offsetWidth` and CSS lengths all live here.
 *
 *   DEVICE px   what the user sees and where the pointer is. `innerWidth`,
 *               `innerHeight`, `getBoundingClientRect()` and
 *               `IntersectionObserver`'s `rootMargin` all live here.
 *
 * At 1920 wide they differ by 1.25x. Any calculation that mixes the two is
 * wrong by exactly that factor, and the failure is invisible below 1536
 * because the zoom is 1 there — which is precisely why it needs naming rather
 * than being left to each call site to remember.
 *
 * Measured in Chrome 154 at 1920x1080 with `zoom: 1.25`:
 *
 *   innerWidth                    1920   (device)
 *   body.clientWidth              1536   (layout)
 *   el.getBoundingClientRect().top  42   (device)
 *   IntersectionObserver rootMargin     device px
 *
 * Everything here is cheap enough to call per event: `getComputedStyle` is the
 * only cost, and the zoom is a single resolved custom property.
 */

/**
 * The effective zoom of the root element — `1` on every viewport at or below
 * 1536, up to `1.25` at 1920 and above.
 *
 * Read from the computed style rather than derived from `innerWidth`, because
 * the clamp has a floor and a ceiling: `innerWidth / 1536` would report 1.67 at
 * 2560 when the zoom is actually capped at 1.25.
 */
export function pageZoom(): number {
  if (typeof window === "undefined") return 1;
  const raw = getComputedStyle(document.documentElement).zoom;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/**
 * The layout viewport width in LAYOUT px — what `100vw` means to the layout,
 * and what a `scrollWidth` should be compared against.
 *
 * `window.innerWidth` is deliberately not used for this: it reports DEVICE px,
 * so on a magnified page it overstates the layout viewport by the zoom factor.
 */
export function layoutWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth / pageZoom();
}

/**
 * The layout viewport height in LAYOUT px. The JS counterpart of `--screen-h`.
 */
export function layoutHeight(): number {
  if (typeof window === "undefined") return 0;
  return window.innerHeight / pageZoom();
}
