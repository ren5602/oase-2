# OASE

A production-quality café website for **OASE — Coffee & Calm**, rebuilt natively
in Next.js from a Framer reference (`altruistic-pitch-532973.framer.app`). No
Framer runtime, no iframe, no embedded frames — the design and motion language
are reimplemented from scratch.

> **Status: Step 8 of 9 complete.** Navbar, Hero, Signature, Menu, Experience,
> Bean to Cup, Gallery and CTA are built. See [Build order](#build-order) below.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with a CSS-variable design system |
| Motion | GSAP 3 + ScrollTrigger, plus hand-written rAF where a timeline would be the wrong tool |
| Images | `next/image`, all assets local under `public/images/` |

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start
npm run typecheck    # tsc --noEmit
npm run lint
```

---

## Desktop only, and magnified above 1536

The reference ships `<meta name="viewport" content="width=1440">` and a fixed
`1440 × 11286px` canvas with **zero media queries**. There is no responsive
design to port and none was invented.

This build targets desktop only. **There are no mobile or tablet breakpoints.**
`clamp()` and `vw` are used solely so the desktop layout interpolates cleanly
across **1280 / 1440 / 1536 / 1600 / 1920**. Primary comparison viewport:
**1536 × 900**.

### The page magnifies itself above 1536

The composition was built and verified against a **1536 CSS-px viewport**,
because that is what 125% browser zoom produced on a 1920 monitor during
development. At 100% zoom the viewport is 1920 CSS px and the 1920 composition
renders instead — a different, airier layout than the one the design was tuned
to.

So the page now **lays out at 1536 and magnifies up to 1.25×**, via `zoom` on
the root element:

| device width | zoom | layout width |
|---|---|---|
| 1280 / 1440 | 1 | 1280 / 1440 (unchanged) |
| 1536 | 1 | 1536 |
| 1600 | 1.042 | 1536 |
| **1920** | **1.25** | **1536** |
| 2560 | 1.25 (capped) | 2048 — more air |

The full mechanism, the traps it exposes, and why the tokens exist are
documented in [Page zoom](#page-zoom--the-design-is-1536-wide-magnified-up-to-125).
The short version: **viewport units are not compensated by `zoom`**, so every
`vw` / `svh` in the project is written against `--screen-w` / `--screen-h`
instead, and JS that mixes `innerWidth` (device px) with `scrollWidth` (layout
px) uses `lib/viewport.ts`.


---

## What the reference actually contains

Read directly from the Framer export's stylesheet and DOM rather than guessed at.
This matters, because several assumptions the brief makes are not true of it:

| Brief asks for | Reference actually has |
|---|---|
| `OASE` wordmark | **No text.** "OASE" appears 0 times in the DOM; the wordmark exists only inside a raster image |
| Home / Signature / Menu / Experience / Gallery | **Zero `<a>` tags.** No `<nav>`, no `<header>` |
| "Visit OASE" CTA | **Does not exist** |
| Section-aware nav colour states | **One static element**, no state logic |

What does exist is a single decorative, non-interactive `<div>`: `80×44px`,
`position:fixed; top:12px; right:12px`, no `cursor:pointer`, no `href`, no
`aria`. Its background is an inline SVG, so the geometry is exact — 4px radius
top-left/top-right, a **square bottom-right**, and a **chamfered bottom-left**:

```
M 80 4 C 80 1.791 78.209 0 76 0 L 4 0 C 1.791 0 0 1.791 0 4
L 0 25 L 11.216 42.186 C 11.955 43.318 13.215 44 14.566 44 L 80 44 Z
```

It also has no `backdrop-filter`, and its three bars sit at `x` 28–52, `y` 10 /
19.14 / 28.28, `h` 5.72, `rx` 2.86.

The reference covers only **Hero, Signature and Menu** (as two fan carousels).
Experience, Bean to Cup, Gallery, CTA and Footer do not exist in it, so those are
original work in the same visual language.
### Extracted tokens

| Token | Value | Origin |
|---|---|---|
| `--color-cream` | `#fefefc` | reference `rgb(254,255,252)` |
| `--color-ink` | `#0b0b0b` | reference foreground |
| `--color-coffee` | `#76453b` | reference hero background |
| `--color-coffee-deep` | `#59342c` | reference card-description colour |
| `--color-amber` | `#e39f01` | reference `rgb(227,159,1)` hero accent |
| `--color-coffee-dark` | `#2a1712` | deeper tone for dark surfaces |
| `--color-amber-deep` | `#a06a00` | **not the reference's** — amber fails AA on cream (2.25:1), so the accent is a pair chosen by ground. See [Bean to Cup](#bean-to-cup--original-work-and-the-wheel) |

**Typography:** the reference sets *all* display type in **Plus Jakarta Sans
700** — not a serif. It loads weights 600 and 700 only. `letter-spacing`
resolves to `0` everywhere, and uppercase is typed literally rather than applied
via `text-transform`. Hero type is `132px`; section headings `64px`.

**Fraunces** is named in the reference's card-title CSS but never actually
loaded, so it silently falls back to a generic serif there. It is loaded
properly here to honour the intent, and confined to small accents.

---

## Architecture

```
app/
  layout.tsx              fonts, metadata, skip link, Navbar
  page.tsx                section composition
  globals.css             design tokens, base, components, reduced motion

components/
  navbar/Navbar.tsx       fixed OASE wordmark + 80x44 chamfered pill
  navbar/NavOverlay.tsx   fullscreen menu, focus trap, staggered entrance
  hero/Hero.tsx           MAKE YOUR DAY + cup + bean texture + scroll cue
  signature/Signature.tsx five-phase pinned panel choreography
  menu/Menu.tsx           fan carousel with autoplay, tabs, keyboard
  experience/Experience.tsx  sticky horizontal strip
  bean-to-cup/BeanToCup.tsx  the six stages as a turnable wheel
  gallery/Gallery.tsx     masonry grid, captions, column reveal
  gallery/GalleryLightbox.tsx  the photo dialog
  cta/Cta.tsx             closing panel: text + two overlapping cards
  ui/works-wheel.tsx      ring -> drum wheel, one rAF pass, own scroll
  ui/SplitText.tsx        per-character reveal primitive (aria-safe)
  ui/ChamferButton.tsx    the reference pill's silhouette, as a button

data/
  site.ts                 nav labels, tagline, location, hours, contact
  signature.ts            panel offsets, phase boundaries, geometry
  menu.ts                 drinks + foods items, categories, price format
  experience.ts           the five moments, true aspect ratios
  beanToCup.ts            the six stages, copy and alt text
  gallery.ts              twelve photographs, measured ratios, optimal
                          column partition, row-major reading order
  cta.ts                  closing copy, the two actions, the two cards

lib/
  useSectionTheme.ts      IntersectionObserver -> which theme is under the nav
  viewport.ts             pageZoom() / layoutWidth() — device px vs layout px
  scrollLock.ts           page scroll lock while the overlay is open
  animations.ts           shared easing / duration / reveal tokens,
                          incl. the critically damped text-reveal ease
  fanLayout.ts            fan slot geometry (scale / rotate / translate)
  utils.ts                `cn()` — clsx + tailwind-merge
```

Content is kept separate from presentation. Nothing in `components/` hardcodes a
menu item or a contact detail.

---

## Implementation notes

### Page zoom — the design is 1536 wide, magnified up to 1.25

The composition was built and verified against a 1536 CSS-px viewport. That was
not a choice: it is what **125% browser zoom** produced on the 1920 monitor this
was developed on, and it was mistaken for the 1920 default for the whole of the
build. At 100% zoom the viewport is 1920 CSS px, so the 1920 composition renders
— the same design, but with a quarter more air in it than any of the measured
values assume.

Rather than re-tune the layout for 1920, the page now lays out at 1536 and
magnifies itself, via `zoom` on the root element:

```css
:root { --zoom: 1; --screen-h: 100svh; --screen-w: 100vw; }   /* fallback */

@supports (zoom: calc(100vw / (1536 * 1px))) {   /* literal: @supports can't read var() */
  :root {
    --zoom:     clamp(1, calc(100vw / (1536 * 1px)), 1.25);
    --screen-h: calc(100svh / var(--zoom));   /* one screen, in LAYOUT px */
    --screen-w: calc(100vw / var(--zoom));
  }
}
html { zoom: var(--zoom); }
```

`zoom` rather than `transform: scale()` because it scales the **layout** — the
layout viewport itself becomes 1536 — which is what makes every existing
measurement still mean what it meant. A transform would scale a painted copy of
a 1920 layout and change nothing about how it was composed.

The clamp's three jobs: `1` below the reference width, a fluid `1..1.25` across
1536..1920, and a hard ceiling above it. It also composes correctly with real
browser zoom — at 150% browser zoom on a 1920 window `100vw` is 1280, so
`--zoom` clamps to 1 and the two never multiply into a double zoom.

#### Viewport units are NOT compensated — this is the trap

Measured in Chrome 154 at 1920 × 1080 with `html { zoom: 1.25 }`:

| unit | resolves to | should be |
|---|---|---|
| `100vw` | 2400 device px | 1920 |
| `100svh` | 1350 device px | 1080 |
| `calc(100svh / 1.25)` | 1080 device px | 1080 ✓ |

A viewport unit is resolved against the **outer** viewport and then multiplied
by the effective zoom, so every `vw` and `svh` in the file overshot by exactly
the zoom factor. `--screen-h` and `--screen-w` divide that back out, which makes
them "one viewport, in layout px".

**So a raw viewport unit anywhere in this project is a bug that only shows above
1536.** Every one of them is written as a multiple of a compensated token:

```css
--text-body:       clamp(0.9375rem, calc(0.0105 * var(--screen-w)), 1.0625rem);
--spacing-gutter:  clamp(1.5rem,    calc(0.05   * var(--screen-w)), 5rem);
.sig-track         { height: calc(6 * var(--screen-h) + 1200px); }
.fan               { --u: clamp(0.55px, calc((var(--screen-h) - 379px) / 476), 1px); }
```

`100vh`-style utilities in components are `min-h-[var(--screen-h)]` for the same
reason. Every reference geometry value — 132px hero type, the 1796px cup, the
1200 × 800 panels, the 200 × 370 cards — stays a **verbatim layout-px constant**,
which is precisely why it now magnifies with the page instead of needing
re-tuning.

#### Two coordinate systems in one DOM

`zoom` splits the DOM in two, and mixing them is wrong by exactly the zoom
factor:

| LAYOUT px | DEVICE px |
|---|---|
| `clientWidth`, `scrollWidth`, `offsetWidth` | `innerWidth`, `innerHeight` |
| CSS lengths, `getComputedStyle` | `getBoundingClientRect()` |
| `getComputedStyle(...).transform` | `IntersectionObserver` `rootMargin` |
| `window.scrollY` (in px *scrolled*) | pointer `clientX` / `clientY` |

Below 1536 the two are equal, which is exactly why this needed a helper rather
than a convention: `lib/viewport.ts` exposes `pageZoom()`, `layoutWidth()` and
`layoutHeight()`. Three call sites had a real bug:

1. **Experience** subtracted `innerWidth` (device) from `scrollWidth` (layout),
   so the strip travelled 25% too short and stranded the last panel.
2. **`useSectionTheme`** compared a layout-px `PROBE` against a device-px
   `rect.top`, so the theme band sat 8.5px above the pill's centre and flipped
   early on every boundary. The probe is scaled up into device px, because
   `rootMargin` cannot be expressed in layout px at all.
3. **The wheel's drag** divided a device-px `clientY` delta by a layout-px
   constant, making a drag 1.25× as sensitive as the same gesture at zoom 1.

The Hero's pointer tilt needed no change: `clientX` and `innerWidth` are both
device px, so that normalisation was already correct.

#### The pin that could not be fixed

Experience originally used GSAP's `pin: true`. Under zoom it broke in a way no
single value could repair, because GSAP writes the two halves of a pin in
different units:

| quantity | value at 1920 × 960, `zoom: 1.25` | unit |
|---|---|---|
| strip overflow | 841 | layout px |
| pin-spacer extra height | 1051.3 | device px (GSAP scaled it) |
| `end: '+=' + distance()` | 841 | scroll px (GSAP did not) |

So the spacer reserved 1051 device px of scroll while the pin lasted 841, and at
release the section jumped **191px** down the screen before sitting still for the
rest of the rail. Scaling `distance()` by the zoom for `end` alone made it worse
(263px), because it then over-reserved by the same factor. There is no value that
satisfies both constraints, because one number cannot be in two units.

The fix is `position: sticky`, which is what Signature already used: the rail's
height and the sticky child's height are both layout px, so the browser resolves
the pinned range in the same coordinate space the layout is built in. It also
removes the pin-spacer from the document entirely. The rail's travel is written
from JS as `--exp-dist` (a measurement, in layout px) and defaults to `0px`, so
the section is the right height even if the script never runs.

Verified after the rewrite: **0.0px discontinuity** across the whole rail, strip
travel 1:1 with scroll at both 1920 (zoomed) and 1536 (plain), and identical end
states.

#### What was verified

A zoomed 1920 × 960 render and a plain 1536 × 768 render were compared element by
element, converting device px back to layout px. Every measurement matched within
**0.2px**: hero, hero type group, cup, signature heading, panels and sticky stage,
fan and card, menu section, Experience rail and pin, Bean to Cup stage, the nav
pill, body font size. No horizontal overflow at any width from 1280 to 2560. The
theme probe flips on the same sections at both widths, and the reduced-motion path
still reaches all six Experience panels.

Residual: scrollbars mean the effective layout is ~1524px rather than 1536 on a
real window — which is what 125% browser zoom did too, so it stays faithful to
the view this was built against.

### CSS cascade layers — read this before adding a class

Tailwind v4 emits its rules inside `@layer` blocks. **Any rule written outside a
layer beats every layered rule**, regardless of source order or specificity, so
an unlayered custom class silently defeats Tailwind utilities on the same
element.

The rule this project follows:

- Base resets → `@layer base`
- Reusable classes (`.display`, `.shell`, `.press`, `.link-slide`, …) →
  `@layer components`

Utilities then always win, which is the expected mental model. The reduced-motion
block is unlayered on purpose so its `!important` declarations cannot be inverted
by layer order.

### The pill inverts, and how

The reference has no state logic at all. Here, `useSectionTheme` reports which
section sits under the pill, and the pill inverts to stay legible against it.

Sections opt in by declaring `data-theme="light|dark|ink"`. The nav never
hardcodes a colour and never needs to know a section's name — adding a section
later requires only the attribute.

The same attribute also publishes four tokens for any component that has to work
on more than one ground (`--section-fg`, `--section-muted`, `--section-accent`,
`--section-shadow`), each chosen to clear 4.5:1 against its own `--section-bg`.
The nav reads the first two; the Bean to Cup wheel reads all four. See
[Theme tokens](#theme-tokens).

Mechanically, an `IntersectionObserver` watches a band across the upper
viewport. It fires only when the *set* of sections in that band changes, which
happens exactly at section boundaries — precisely when the answer can change.
`getBoundingClientRect()` therefore runs a handful of times per page rather than
on every scroll tick. The probe sits at `y=34px`, the pill's vertical centre.

### One control, not two

The pill stays above the overlay (`z-130` vs `z-120`) and morphs its three bars
into a close cross, so a single control opens and closes rather than two
controls swapping places. That keeps the reference's lone-piece-of-chrome idea
intact.

The Tab trap therefore queries `[data-nav-focus]` across the document rather
than only inside the panel, picking up the wordmark, the pill and the links in
DOM order. Trapping to the panel alone would strand a keyboard user with no way
to close.

### Entrance and exit are asymmetric

The overlay enters over 700ms and its contents stagger at 55ms intervals. Exit
zeroes every delay, so dismissal clears immediately rather than waiting out the
cascade — slow where the user is deciding, fast where the system is responding.

### Reduced motion

Under `prefers-reduced-motion: reduce` the global rule collapses transition
durations. This is verified not to leave the overlay contents stuck at
`opacity: 0`: the links' resting opacity is driven by the `open` boolean, not by
the transition, so they still reach 1.

---

## Build order

Sections are built and reviewed **one at a time**.

| Step | Section | Status |
|---|---|---|
| 1 | Navbar | ✅ complete |
| 2 | Hero | ✅ complete |
| 3 | Signature | ✅ complete |
| 4 | Menu | ✅ complete |
| 5 | Experience | ✅ complete |
| 6 | Bean to Cup | ✅ complete |
| 7 | Gallery | ✅ complete |
| 8 | CTA | ✅ complete |
| 9 | Footer | ⬜ not started |

### Hero — measured, not estimated

The Hero is a pixel recreation. Every value was read from the reference in a
live browser rather than inferred from its stylesheet:

| Element | Reference geometry |
|---|---|
| Hero | `100vh`, `overflow: hidden`, bg `#76453b` |
| Type group | `inset: 154px 734px 154px 113px` → 593 × 592 |
| MAKE | `top: 0; left: 0` |
| YOUR | `top: 48%; right: -8px; translateY(-50%)` |
| DAY | `bottom: 9px; left: 90px` |
| Cup | 1796px wide, `top: -82px; right: -469px` |
| Bean texture | 1094px square, `opacity: .2`, `bottom: -200px; right: 516px` |
| Scroll cue | 112 × 39 at `calc(86.25% - 19.5px)` / `calc(28.4722% - 56px)` |

Verified against the reference at 1440 × 900, every element lands within
**0.4px** — and the cup, cue and headline match at 1280, 1600 and 1920 too.

Three findings worth recording, because each one contradicts a reasonable
assumption:

1. **The type is a fixed 132px, not fluid.** Measured identical at all four
   widths. An earlier `clamp()` here shrank `MAKE` to 339px at 1280 while the
   reference held 380px. The cup is a fixed 1796px, so the type has to hold its
   size for the two to stay in the same relationship.

2. **There is no scroll parallax on the hero.** The cup moves exactly 1:1 with
   scroll (−300px for 300px of scroll), so it is not animated at all. A
   parallax here would have been invented motion, not reference motion.

3. **The cup has a pointer tilt.** Moving the pointer across the hero applies a
   3D transform to the cup — a subtle tilt-and-scale that makes it read as
   floating in front of the page. Measured on the reference, it displaces the
   cup by up to ~88px. It is reproduced with `gsap.quickTo`, so a fast mouse
   retargets one tween instead of spawning a new one per event.

   The tilt lives on a **separate nested element** from the entrance. Both
   write to `transform`, and the tilt sets `transformPerspective`, which makes
   GSAP re-parse and rewrite the whole matrix. Sharing one node meant the two
   writers clobbered each other and left the cup stranded at its entrance start
   state — a real bug, caught by measuring the cup's position after the
   entrance rather than trusting the screenshot.

The character reveal is the reference's own: each glyph starts at
`opacity: 0.001` with a 10px blur and 10px rise, over ~1.2s. Only the **front**
copy of each word is animated — the gold hover copy is translated out of the
clip window at rest, so animating it would be invisible work that also doubled
the character count from 11 to 22 and stretched the stagger.

### Hero word hover

Each word is a clipped box holding two stacked copies. At rest the cream copy
sits in the window; on hover the stack translates up by `1.2em` to reveal the
gold `#e39f01` copy. The reference flips flex `order` instead; `translateY`
produces the same result and animates smoothly.

`app/page.tsx` now renders the Hero and Signature. The two temporary
verification bands used during Step 1 have been deleted.

### Signature — not a card grid

The single most important finding: **the reference does not crossfade four
images.** All four panels are on screen the whole time, stacked at centre, and
scroll drives them through a five-phase choreography. Measured at 1440×900:

| Phase | What happens |
|---|---|
| 1 spread | stack → 2×2 corners, `scale 1 → 0.4` |
| 2 shuffle | the two right-hand panels trade vertical positions |
| 3 converge-x | both columns slide to the centre line |
| 4 converge-y | all four collapse onto one another |
| 5 zoom | the top panel scales `0.4 → 5`, filling the screen |

Geometry, from the reference: panels are a fixed `1200 × 800`, centred
(`x = (viewport − 1200) / 2`), caption bar `#0b0b0b80` with `24px` padding and a
`64px/700` title at `line-height 1.2` (giving the reference's 124.8px bar
height). Corner offsets are `±250, ±170`; after the shuffle the right column
becomes `±250, ∓170`. Phase boundaries come from the reference's own pin, which
runs `y=1700 → 7400` with transitions at 2700 / 3900 / 5100 / 6300.

Three implementation notes that were not obvious:

1. **`position: sticky`, not GSAP `pin`.** That is what the reference uses, and
   it needs no pin-spacer wrapper and never mutates the document, so
   ScrollTrigger only has to *read* scroll. It also means `overflow-x: clip` on
   `body` stays safe — `clip` does not create a scroll container, so sticky
   still works where `hidden` would have broken it.

2. **Centring is a single-cell grid, not margins.** `margin: -600px` was the
   first attempt and it broke: a `m-0` utility on the same element silently
   defeated it, because Tailwind's utilities beat the components layer by
   design. A `translate(-50%,-50%)` was also wrong — it would put a second
   writer on `transform`, which GSAP already owns. `display: grid` with
   `place-items: center` sidesteps both.

3. **`sizes` must describe the largest render, not the resting one.** The zoom
   scales the top panel to 5×, so it renders 6000px wide. With `sizes="1200px"`
   the browser never requested anything larger and the zoom upscaled a 1200px
   file no matter how large the source on disk was. The reference ships a
   **7074×4716** sandwich for exactly this reason; the two panels that grow are
   re-encoded to 3200px here, which keeps the zoom sharp without carrying the
   reference's 1.1MB payload.

The panels have **no hover state** in the reference (verified: `cursor: auto`,
no transform change on pointer-over), so none was invented.

### The heading's text effect, measured

"TASTE OUR SIGNATURE" is split into **17 per-character spans** and revealed
with a per-character blur-and-rise, exactly as the reference does it. Sampled
at 60fps across four runs:

| Property | Reference | Here |
|---|---|---|
| Characters | 17 (5 + 12) | 17 |
| Block size | 521 × 128 | 521 × 128 |
| Stagger | 50ms, forward | 50ms, forward |
| Total span | 801ms | 799ms |
| Per-char 5%→95% | 583ms | 583ms |
| Start state | `opacity .001`, `blur(10px)`, `y+10px` | same |
| Trigger | heading top at viewport bottom | same |
| Repeat | one-shot, never resets | same |

**The easing is a critically damped spring, not a power curve.** Fitting the
measured opacity trace against every candidate:

| Ease | RMS error vs reference |
|---|---|
| critically damped spring | **0.0117** |
| cubicOut (power2) | 0.0314 |
| quartOut (power3) | 0.0357 |

The spring wins by nearly 3×, which matches how Framer animates text by
default. It is `1 − (1 + x)e^−x`, the exact solution for a critically damped
system: fast initial acceleration, a long smooth tail, no overshoot.

Two things about that function are worth recording, because the first one cost
real time to find:

1. **`duration` does not affect wall-clock timing.** Solving the curve for a
   fraction `f` gives a fixed `x_f`; since `x = K·p` with `K = omega·duration`
   while `p = t/duration`, the duration cancels and `t_f = x_f / omega`. The
   tween's `duration` only sets how finely the curve is sampled — the speed is
   governed entirely by `omega`. Three successive changes to `duration`
   (1.99 → 2.2 → 2.35) produced a bit-identical curve before this was spotted.
   `OMEGA` is the single tuning knob.

2. **The analytical fit needed an empirical correction.** It put omega at 8.4,
   which rendered ~25ms fast at the 50% crossing — GSAP applies its first
   update a frame or two after the trigger fires, and the reference's Framer
   runtime does the same. Two measured points (8.4 → 170ms, 7.2 → 217ms) fix
   the constant, and **7.48** lands the crossing on the reference's 200ms.

Accessibility note: splitting text per character destroys the accessible name —
the two lines concatenate to `"TASTEOUR SIGNATURE"`, and per-word `aria-label`s
on plain spans are not reliably announced. The `<h2>` therefore carries the
real text via `aria-label` and the visual composition is `aria-hidden`, the
same pattern the Hero uses. Under reduced motion the heading renders fully
visible with no blur; it is never left in its hidden start state.

### Menu — a fan carousel, not a card grid

The reference presents the menu as a fan: five cards visible in an arc around
the active one. Each slot was measured by decoding the cards' `matrix()` into
scale and rotation:

| Offset from active | Scale | Rotation | Translate |
|---|---|---|---|
| −2 | 0.7756 | −21° | (−480, 116.8) |
| −1 | 0.9439 | −10.5° | (−240, 29.2) |
| 0 | 1 | 0° | (0, 0) |
| +1 | 0.9439 | 10.5° | (240, 29.2) |
| +2 | 0.7756 | 21° | (480, 116.8) |

Cards outside that window park at `scale 0.5`, `translateX ±640`, `opacity 0`.
Card is `200 × 370` with a `200 × 300` frame, `border-radius: 12px`,
`box-shadow: 0 8px 24px rgba(0,0,0,.15)`, and the label hangs at `top: 308px`
below the photograph — price `32px/600` at `line-height 1.05`, name `14px/600`
in Fraunces, description `12px/400` in `#59342c`. Controls are 44px circles with
`backdrop-filter: blur(16px)`, 8px dots, `gap: 16px`, `margin-top: 40px`.

Autoplay is a measured **4000ms**, wrapping 5 → 0. The step transition runs
**380ms** (measured 367ms).

**Three deliberate departures**, each because the reference's version is not
usable as a menu:

1. **One deck, not two.** The reference ships two identical fan carousels — the
   first with no text at all, the second carrying the price and name. Here one
   deck does both, because the labels are the entire point of a menu.
2. **Cards are real `<button>`s.** In the reference they are `<div>`s with a
   click handler, so nothing is reachable by Tab and the deck is unusable
   without a pointer. Parked cards get `inert` so Tab walks 5 cards, not 6.
3. **It stops.** The reference auto-advances forever and does not pause on
   hover, which moves the price and name while you are reading them. Rotation
   pauses on hover and on focus, and is disabled outright under reduced motion.
   Manual stepping still works there.

Descriptions are the reference's own with the spelling corrected — it ships
"smoth blend coffe", "zamn its good" and "Taste nature flavour". Names, order
and prices are untouched.

#### Why the section clips horizontally

`.fan` is `overflow: visible` on purpose: the arc is much wider than the deck
box (outer cards at ±480px, parked at ±640px), so clipping at the box would cut
the outermost cards in half. But at 1280 the parked card lands 50px past the
viewport edge and made the whole document horizontally scrollable — measured
`scrollWidth 1370` vs `clientWidth 1280`, 90px of play.

The fix is `overflow-x: clip` on the **section**, not the deck. `clip` rather
than `hidden`, because `hidden` would create a scroll container; and on the
section rather than `body`, because `overflow-x: clip` on `body` does **not**
propagate to the viewport the way `overflow: hidden` does — which is exactly why
the first attempt did nothing. The reference solves the same problem the same
way, one level up on its page root.

One more bug worth recording: the card frame is a `<span>` inside a `<button>`,
and a span is inline by default, so `width`/`height` were ignored and the frame
collapsed to **0×0** — the photograph never rendered. `display: block` is
load-bearing there.

#### The label overlapped the photograph

The card box is `370px`, but the frame is `300px` and the label is absolutely
positioned at `top: 308px`. In a `<button>`, the browser **centres in-flow
content vertically** — and because the label is `position: absolute` it is out
of flow, leaving the frame as the only in-flow child. So Chrome placed it at
`(370 − 300) / 2 = 35px`, and the frame then ran to `y=335`, overlapping the
label at `y=308` by 27px.

The fix is `display: flex; flex-direction: column; justify-content: flex-start`
on the card, which pins the frame to `y=0`.

Worth noting how the first attempt failed: the obvious explanation was a
line-box strut, and `line-height: 0` was applied — the computed style confirmed
it took effect, and the frame still did not move. `display: block` did not fix
it either, because Chrome's internal button centring survives a display change.
Only measuring `frame.offsetTop` and working back from `(370 − 300) / 2 = 35`
identified the real cause.

#### Fitting the viewport

The section is `min-h-[var(--screen-h)]` with a flex column, so it occupies
exactly one viewport. The reference has no such constraint — it ships two
separate 900px sections, so the pacing problem never arises.

Getting there took two passes, and the second one mattered:

**First attempt** trimmed the section's padding from the viewport-relative
`--spacing-section` token to a fixed `py-16`. That fixed 900px, but only for
900px. The deck is a fixed **476px** and the rest of the content is another
379px, so the section had a hard floor of **855px** — on any viewport shorter
than that it overflowed and the heading was pushed off the top. A 1920-wide
browser window with chrome is about **780px** tall, which is exactly where this
broke in practice.

**Second attempt** makes the deck itself scale. `--u` is a *unit length* that
equals `1px` when there is room and shrinks below that:

```css
--u: clamp(0.55px, calc((var(--screen-h) - 379px) / 476), 1px);
```

(`--screen-h` rather than a raw `100svh`: the page magnifies itself above 1536,
and a viewport unit is not compensated by `zoom`, so the raw form would size the
deck for a taller viewport than the one it is in.)

Every fan dimension is then a multiple of it — `calc(200 * var(--u))` for the
card, `calc(308 * var(--u))` for the label offset, and so on. One value scales
the whole composition coherently: the arc, the rotations and the overlaps all
stay exactly as measured, and above the threshold `--u` is `1px` so the
reference geometry is untouched.

A unit length rather than `transform: scale()` on the deck, because a transform
leaves the layout box at its full 476px and the section would still overflow.
Expressing the *sizes* in `--u` shrinks the box itself.

The controls deliberately do **not** scale — they sit outside `.fan`, so the
`var(--u, 1px)` fallback applies and they stay a true 44px. Shrinking an
interactive target to buy vertical room would trade an accessibility floor for
cosmetics, and the height budget reserves their full size.

| Viewport | Section | Card height |
|---|---|---|
| 1280 / 1440 / 1600 × 900 | 900 | 370 (reference) |
| 1920 × 1080 | 1080 | 370 (reference) |
| 1920 × 780 | 780 | 312 |
| 1440 × 800 | 800 | 327 |
| 1440 × 700 | 700 | 250 |

The `0.55px` floor stops the fan shrinking without limit; below roughly 640px
tall the section scrolls instead, which is the right trade.

### Experience — original work

**Not in the reference.** The Framer build covers Hero, Signature and Menu only,
so this section was designed from scratch in the language those three
established: dark ground (`--color-coffee-dark`), display type in Plus Jakarta
Sans 700, Fraunces for small accents, amber as the single accent.

Vertical scroll drives horizontal travel. The section is held still for the
length of the strip's overflow and the track is translated by the same distance
with `scrub`, so one scroll position maps to exactly one horizontal offset —
there is no second scrollbar to fall out of sync.

The distance is read from the track's **live `scrollWidth`** rather than
hardcoded, so adding or removing a panel lengthens the rail automatically
instead of clipping the last one, and it is re-measured on every ScrollTrigger
refresh so fonts and images that settle after load cannot leave it stale.

**`position: sticky`, not GSAP's `pin`** — and this changed. The section shipped
on `pin: true` with `pinSpacing` left on, which was the right choice at the time
and is now impossible: GSAP writes a pin's spacer in layout px but measures its
`end` in scroll px, and once the page magnifies itself those are different units.
The full measurement is in
[Page zoom](#the-pin-that-could-not-be-fixed); the short version is a 191px jump
at release and no single `end` value that fixes it, because one number cannot be
in two units. Sticky keeps the rail and the pinned range in the same coordinate
space, and removes the pin-spacer from the document. It is now the same
mechanism Signature uses, for the same reason.

The rail (`.exp-rail`) IS the scroll distance: one screen plus `--exp-dist`,
which JS writes in layout px from the measured overflow. It defaults to `0px`, so
the section is exactly one viewport tall — correct, if untravelled — even if the
script never runs.

**The rhythm is the photographs' own.** Each panel is given the same *height*
and its width follows from `aspect-ratio`, so the strip alternates narrow and
wide purely because the source images do. A fixed width would have flattened
that into a grid.

**Viewport fitting came free this time.** Everything derives from one token,
`--exp-img-h: clamp(200px, 58svh, 620px)` — written against `--screen-h` so it
means the same thing on a magnified page. A short viewport shrinks the
photographs rather than pushing the section past the fold. Measured fit at
1280/1440/1600 × 900, 1920 × 1080, and down to 1280 × 650.

Under reduced motion there is no sticky and no translation — but the strip becomes
a **native horizontal scroller**, which matters: without it the track would
simply overflow and the later panels would be permanently unreachable. The rail
also collapses to `height: auto`, since with no travel there is nothing for the
sticky child to hold still for. The reduced-motion path loses motion, not
content — verified to reach all six panels at both 1920 and 1536.

#### The title that wrapped on its own

`Coffee Conversations` broke onto two lines while every other title stayed on
one, which broke the strip's rhythm. The cause was a `max-width: 32ch` on
`.exp-panel__meta` — intended as a readable *measure* for the description, but
it constrained the **title** too. The title needs 354px; the cap allowed
350.3px. Four pixels.

Moving the measure to the description fixed it, but adding `white-space:
nowrap` then exposed a second, more interesting bug. Panel width is a function
of viewport **height** (`--exp-img-h`, 58svh) while the title's font-size was a
function of viewport **width** (`1.9vw`). Those two diverge on a short-and-wide
viewport, producing narrow panels carrying large type — measured at 1920×650
and 2560×700, `Evening Gatherings` needed 334px inside a 333px panel and
overflowed. That measurement predates the page-zoom change; the units now differ
but the divergence it exposed is the same one, so the fix below still holds.

The fix ties the type back to the panel rather than the viewport:

```css
.exp-panel__meta   { container-type: inline-size; }
.exp-panel__title  { font-size: min(clamp(1.375rem, calc(0.019 * var(--screen-w)), 1.875rem), 7.2cqi); }
```

(The width term is a multiple of `--screen-w` rather than a raw `1.9vw`, so it
still means what it meant once the page magnifies itself.)

`cqi` is relative to the query container, so the title can never outgrow the
panel no matter how the two viewport axes are combined. Verified across nine
viewports from 1280×650 to 3440×720: every title one line, zero overflow.

A note on measuring this: the first probe cloned the title onto `document.body`
to read its natural width, but `cqi` resolves against the *nearest container* —
and `body` is a different one — so the clone rendered at a different size than
the element it was copying. Comparing `scrollWidth` to `clientWidth` on the live
node is the honest test.

Under reduced motion the panels render in their spread state as a static 2×2
composition. The timeline's resting state is "stacked", which would be four
images piled on one another — so this is set explicitly rather than left to the
default.

### Bean to Cup — original work, and the wheel

**Not in the reference.** Six stages, rendered as a wheel you turn: at rest the
cards sit in a ring around the section title, the first notch of scroll blows the
ring open into a vertical drum, and turning carries the next stage round to the
front. The whole thing is one number read by a single rAF pass that writes
transforms straight to the DOM.

**The input model is the interesting part, and it was wrong at first.**

The wheel originally advanced by `deltaY / 900` and then, 140ms after the last
wheel event, rounded the result onto an item. That is wrong for the most ordinary
gesture there is: a mouse notch is **100px**, which is 0.11 of an item. The settle
then rounded it back to where it started — while `preventDefault` had already
eaten the page scroll. A reader scrolling normally got a wheel that did not turn
and a page that did not move. Measured: twelve consecutive notches at 80ms left
the wheel at the ring, and the page stuck with the section 430px below the fold.
It shipped because the only test drove the wheel with `mouse.wheel(0, 2000)`,
which is not a gesture any input device produces.

Two invariants replaced it:

1. **A gesture the wheel consumes must move it.** The wheel now counts *notches*:
   deltas accumulate, each full 100px advances exactly one item, and the
   remainder is kept. `deltaMode` is normalised first, because Firefox reports
   lines rather than pixels and 3 lines read as 3px would never add up to a notch
   at all. A trackpad's stream of 12px deltas now crosses the notch at exactly
   100px — verified by watching it turn on the tenth event and not the ninth.
2. **The page must never become unscrollable.** The wheel only takes the gesture
   once it fills the frame, and only while it has somewhere to go. Before that —
   and again at either end — the browser keeps the scroll.

Invariant 1 was still wrong, in a way that only shows on a trackpad: accumulating
continuously means one flick turns the whole sequence and then leaks its
remainder into the page. Invariant 2 was also wrong once the Gallery existed —
Bean to Cup stopped being the last section, and the "fills the frame" test only
checked one edge. Both are documented in
[The wheel that skipped the whole section](#the-wheel-that-skipped-the-whole-section)
below, which is the current model.

A third bug surfaced from the same area: releasing a drag was guarded by
`if (target > 1)`, which skipped the entire `0..1` range — precisely the
ring-to-drum transition. A 30/60/120/200px drag left the wheel stranded half-way,
the ring label at half opacity over a half-turned drum, with no way back. Rounding
always lands on a rest state, so the guard is gone.

**The ring is solved, not fixed.** The ring's vertical extent is
`2·ringR + cardH·ringScale`, and `ringScale` is itself proportional to `ringR`, so
the whole thing is linear and has a closed form. Solving it for the stage means
the ring fits at every viewport; the previous constant `cardH · 1.14` produced a
998px ring inside a 900px stage at 1440×900 — 49px sliced off the top and bottom
cards, which is exactly the "closed loop" the ring exists to read as.

**Light ground.** The section declares `data-theme="light"`, so the page runs
coffee → cream → cream → ink → **cream**, which also breaks up what was a
double-dark ending. This is the one section where light needed care, and the
reasoning is in the two findings below.

#### The accent that could not be reused

`--color-amber` is the reference's hero accent, and on a dark ground it is
excellent — 7.50:1 on coffee-dark. On cream it collapses to **2.25:1**, under the
4.5:1 that AA requires and well under what the 13.5px index numerals need. Amber
is simply a light colour.

So the accent is a *pair*, selected by ground rather than darkened by hand:
`--color-amber` on dark, and a new `--color-amber-deep` (`#a06a00`, same hue at
L30%) on light, where it measures **4.56:1**. `--color-amber-deep` is the only
token in the design system that is not the reference's own, and it is marked as
such in `globals.css`.

#### The card plate, and a bug the conversion exposed

Three of the six stages are transparent cutouts, so their card plate is the whole
visual ground for a third of the section. Measured mean-luminance contrast of each
cutout against its plate:

| plate | beans-small | beans-cutout | cup |
|---|---|---|---|
| `coffee-dark` `#2a1712` | **4.30** | **4.32** | 10.29 |
| `coffee` `#76453b` | 1.97 | 1.98 | 4.72 |
| `cream` `#fefefc` | 3.94 | 3.91 | **1.64** |

The wheel had shipped on the brown plate, which puts the bean cutouts at
**1.97:1** — roughly half their pixels below 2:1, reading as mud. That is a bug in
the dark build, found while converting, and fixed here by moving the plate to
`--color-coffee-dark`.

It also settles the question of whether light mode should mean *light cards*. It
should not: the cup is a white object and vanishes against a light plate at
1.64:1. The drum stays a dark object on a light page, which is what lets all three
cutouts read — and the photographs are near-black anyway (mean luminance
0.04–0.07), so the drum was never going to be uniformly light.

#### Theme tokens

The wheel is a `ui/` primitive, so it must not assume a dark surface. It reads
colour from the same `[data-theme]` contract the nav already used, extended with
the three values a component needs beyond the nav's two:

```
--section-fg      primary text
--section-muted   secondary text
--section-accent  the one accent that passes AA on this ground
--section-shadow  card elevation, which reads very differently on cream
```

Every value clears 4.5:1 against its own `--section-bg`, so a component can use
them for text without re-checking per section. Verified in the suite by computing
contrast from the live DOM.

One implementation note: the wheel's text colours are classes (`.wheel-fg`,
`.wheel-muted`, `.wheel-accent`) rather than Tailwind arbitrary values, because
`tailwind-merge` cannot distinguish `text-[var(--section-fg)]` from
`text-[var(--section-muted)]` — both are bare `var()` references with no unit for
it to classify, so it treats them as the same property and drops the first. On the
index buttons, which apply one at rest and the other when active, that silently
deleted the resting colour.

#### The index that did not line up with the pill

The stage index was anchored with `top-[7.5%] right-[2.5%]` — percentages of the
**viewport** — while the nav pill is anchored to `.shell`. Two different frames of
reference, so the two drifted apart:

| viewport | pill right | index right | drift | vertical gap |
|---|---|---|---|---|
| 1280×900 | 1216 | 1248 | 32px | 12px |
| 1600×900 | 1488 | 1560 | 72px | 12px |
| 1920×1080 | 1648 | 1872 | **224px** | 25px |
| 1280×650 | 1216 | 1248 | 32px | **−7px** |

The horizontal drift grows with the viewport, because `.shell` is capped at
96rem and centred while a percentage is not. The vertical error was worse than
cosmetic: `7.5%` is 68px on a 900px-tall viewport but 49px on a 650px one, and
the pill occupies 12..56px — so on a short viewport the first row sat *inside*
the pill.

The fix is to stop using a second frame of reference. The index is now wrapped in
`.shell`, so its right edge is the pill's own by construction — same container,
same `padding-inline`, same centring — and `--nav-clearance` (12px offset + 44px
pill + 24px gap = 5rem) replaces the percentage on the other axis. Measured 0px
drift and a constant 24px gap from 1280×650 to 1920×1080.

The general lesson is in the token: a percentage of the viewport is the wrong
unit for clearing a **fixed** element, because the two only coincide at one
viewport size.

#### The wheel that skipped the whole section

The most serious bug in the build, and it was in the input model rather than the
geometry.

The wheel advanced one item per **100px of accumulated delta**, continuously. A
mouse notch is 100px, so that reads correctly and every test passed — the only
test drove it with `mouse.wheel(0, 2000)`, which is not a gesture any device
produces.

A **trackpad** does not send one event per notch. It sends a burst. Measured, a
firm flick is ~1570px across ~16 events, and turning an item per event raced the
drum through all six stages in ~150ms. The remaining 833px of that same gesture
then had nowhere to go, so it **leaked to the page** and dumped the reader into
the Gallery with the drum still spinning. That is the "it skips to Bean to Cup's
end and lands in the Gallery" report:

| event | delta | turned | target | leftover |
|---|---|---|---|---|
| 1 | 180 | 1 | 1 | 80 |
| 2 | 200 | 2 | 3 | 80 |
| 3 | 190 | 2 | 5 | 70 |
| 4 | 170 | 1 | 6 | 0 |
| 5–16 | 968 | — | 6 | **833px leaked to the page** |

The fix is **one gesture, one stage**: a continuous stream turns exactly one
item, and the rest of that stream is *swallowed* rather than leaked — the wheel
has taken the gesture, so it must not hand its leftovers to the page. A 60ms
pause starts a new gesture, so a mouse notch (a deliberate click, ~70ms+ apart)
still steps one stage each.

Two earlier attempts at telling the devices apart were written and thrown away,
which is worth recording because both look reasonable:

1. **Delta size.** Does not work. A flick's *opening* deltas are 180–200px —
   **larger** than a mouse notch's 100px — so any size threshold either lets the
   flick through or blocks the mouse.
2. **Event timing, finely tuned.** Works in theory: a trackpad's cadence is
   8–25ms and a fast mouse spin's is ~35ms, so a 30ms threshold separates them.
   But the margin is a few milliseconds, and synthetic input cannot even
   reproduce it — CDP has a ~46ms floor per dispatched event. A rule that cannot
   be verified is not worth shipping.

#### Two more bugs in the same handler, found while fixing that one

**The wheel ate gestures from off-screen.** `inPlace` was `top <= 2`, a
threshold, so once the section had scrolled *past* it stayed true — the reader
deep in the Gallery still measured `top` at -928px, which satisfies `<= 2`.
Measured: four wheel notches moved the page 400px instead of 800px, and
scrolling back up felt like wading. It is now a band, released once the section
is half gone.

**But the first version of that band locked the reader out.** Tightening it to
`top <= 2 && bottom >= innerHeight - 2` collapses to a **0px window** — the
section is exactly one viewport tall, so `bottom >= innerHeight - 2` means
`top >= 2`, and the two conditions together admit only perfect alignment. Since
a 100px notch cannot land on `top === 0`, the wheel could never engage at all.
Wheeling *up* out of the section (which lands `top` at about +100px) left the
reader unable to get back in, because re-aligning is something only the wheel
can do.

So the band is `top <= 20% of the viewport` **and** the wheel closes the last
few pixels itself — `align()`, a `scrollBy` of the remaining offset when it
takes a gesture. Verified: parked 50, 100 and 180px short, one notch snaps to
0.3px every time, and the round trip out and back re-engages and turns again.

The general lesson: **a threshold that only tests one edge of a moving element
is almost always wrong.** Test both, and give the element a way to correct
itself rather than assuming it will be handed the perfect scroll position.

### Gallery — original work, and the one section that just flows

**Not in the reference.** Twelve photographs, laid out as a **masonry**: uniform
column widths, heights following each photograph's own proportions, a caption
under every card.

**It deliberately owns no scroll mechanism**, and that is the design rather than
an omission. Signature pins a five-phase choreography, Menu is a fan carousel,
Experience a sticky horizontal strip, Bean to Cup a wheel — four different ways
of holding the reader still. Twelve photographs do not need a fifth. They need to
be shown.

**This also makes the `#gallery` nav link work for the first time.** The entry
has been in `SITE.nav` since the nav was built, but nothing in the document
carried that id, so it had always gone nowhere.

#### It was a justified grid first, and that was wrong

The section shipped as a justified grid: each row shared a height, and because
the row height was fixed, every width had to be **derived from** its
photograph's ratio — `flex-grow: <ratio>`, so `wᵢ = W·rᵢ/Σr` and the height
came out as `W/Σr`, identical for every tile in the row.

That is a real trick and it was verified to 0.02px, but it is the wrong shape for
the reference, which is a Pinterest-style masonry. A masonry reads the same
relationship **from the other end**: the width is fixed and the height follows
the ratio. Three declarations do it:

```css
.gal-cols  { display: flex; gap: var(--gal-gap); align-items: flex-start; }
.gal-col   { flex: 1 1 0; min-width: 0; flex-direction: column; }
.gal-frame { aspect-ratio: var(--gal-a); overflow: hidden; border-radius: 12px; }
```

`flex: 1 1 0` with `min-width: 0` makes every column exactly equal and stops a
wide photograph from forcing its own column wider. `align-items: flex-start` is
load-bearing too: without it the columns stretch to the tallest and the ragged
bottom — which is the whole character of a masonry — disappears.

Still no viewport units anywhere, so the section needed no work for the page
zoom. Verified at six widths from 1280 to 2560: **ratio error 0.0001, no
overflow**, and a zoomed 1920 render matching a plain 1536 one to within 2.4px
(0.22%, which is sub-pixel rounding of the caption line box under the zoom
multiplier, not drift).

#### Why the columns are grouped the way they are

A column's height is the sum of its photographs' rendered heights plus their
captions and gaps, so **which photographs share a column decides how ragged the
bottom edge is**. With twelve tiles there are 4¹² ≈ 16.7M partitions — few
enough to solve *exactly* rather than greedily:

| column | photographs | height @329px |
|---|---|---|
| 1 | pastry, sign, pour-over | 1177 |
| 2 | workbench, espresso, beans | 1196 |
| 3 | daylight, evening-room, latte | 1174 |
| 4 | counter, from-above, menu-board | 1196 |

Found by bitmask DP over subsets, minimising the tallest column. **Tallest
1196px, ragged bottom 22px — 1.8%.** A greedy DOM-order fill leaves ~450px,
which reads as a broken column rather than a deliberate one.

The result is robust to the geometry changing, because every column holds exactly
three tiles: the caption-and-gap overhead is identical across columns and cancels
out of the spread. Only the ratios matter, so the partition survives the gap
clamp resolving differently at different widths.

#### Order is load-bearing in two directions at once

`index` is **row-major** — the order a reader's eye travels, sorted by each
tile's top edge with ties broken left to right. That is what puts `01 02 03 04`
across the top row, and what makes the lightbox arrows land on the next number
rather than the next tile in the DOM.

But the DOM is built **column by column**, so array order and visual order cannot
both be row-major. The resolution:

- `GALLERY` is column-major — the order the DOM needs.
- `GALLERY_COLUMNS` groups it for rendering.
- `GALLERY_READING_ORDER` sorts it by `index` — row-major, and what the lightbox
  walks.

So the numerals, the visual flow and the arrow keys all agree, and the lightbox
takes its list as a prop rather than importing one, which keeps the decision in a
single place. Verified: opening tile `04` (which is DOM tile 10) and pressing
right lands on `05`, then `06` — the numbers, not the DOM order.

#### The three added photographs

The nine originals covered the counter, espresso, beans, pour-over, sign, evening
room, latte, overhead cup and menu board. Twelve tiles balance better than nine,
so three were added from Unsplash — chosen to **add subjects rather than repeat
them**:

| photograph | adds | ratio |
|---|---|---|
| Morning Pastry | food — nothing else in the set is food | 1.25 |
| The Workbench | the barista's tools: portafilters, ground coffee | 1.5009 |
| Daylight Room | a bright room with people, against the dark evening one | 1.4585 |

The first attempt at this picked three that *looked* varied by description but on
inspection were near-duplicates of existing tiles — a second pour-over and the
same counter shot from the same café. Worth recording because the ratios were
fine and the balance was fine; only looking at the files caught it.

Converted through `sharp` to WebP q82 at 1600px, matching the existing assets'
encoding exactly. **+659 KB.**

#### The lightbox, and the sizing trap

Clicking a photograph opens it full-screen: Escape closes, arrows move through
the twelve with wraparound, Tab is trapped, the backdrop closes but the
photograph itself does not, and focus returns to the tile that opened it.

**The sizing is the part that was wrong first.** The obvious form is
`max-height: 100%` on the image — but a percentage `max-height` resolves against
the parent's height, and the parent is a grid item sized by its own content, so
it computes to `none` and constrains nothing. Measured: a 1600×2400 source
rendered **2016px tall in a 960px viewport**. Definite constraints on the image
itself are what work, because the browser then has two hard limits to fit between:

```css
.lb__img {
  max-width: min(calc(var(--screen-w) - 16rem), 1280px);
  max-height: calc(var(--screen-h) - 8rem);
  width: auto; height: auto;
}
```

`--screen-h` / `--screen-w` rather than `100vh` / `100vw`, because the page
magnifies itself and a raw viewport unit would be 25% too large again.

The **1280px ceiling is derived, not chosen**: the sources are 1600px wide and
the zoom caps at 1.25, so 1280 layout px is exactly 1600 device px — the largest
size at which a photograph is still 1:1 with its own file. Above that the
lightbox would be upscaling. Verified across all twelve at four viewports: zero
overflow, zero upscaling, ratio error 0.0000.

#### Two smaller bugs the verification caught

1. **Focus was silently dropped on close.** `close()` called `focus()` directly,
   but at that moment the grid was still `inert` — and focusing into an inert
   subtree is ignored without error. Measured: `activeElement` stayed on `<body>`
   and the reader lost their place. The restore now runs in an effect *after* the
   re-render that removes `inert`. The trigger is also passed into `open()` from
   the click handler rather than read from `document.activeElement`, because the
   latter depends on the browser having focused the button first — a programmatic
   `.click()` does not, and the restore then had nothing to return to.

2. **GSAP left `transform: translate(0px, 0px)` on the tiles.** An inline style
   beats every stylesheet rule, so they could never take a CSS transform
   afterwards — a silent trap for anything added later. The reveal now clears its
   own `transform` on completion.

#### The hover push moves the photograph, not the frame

`.gal-tile:hover .gal-tile__img { transform: scale(1.04) }` — the photograph
scales *inside* the clipped frame. Scaling the frame itself would move its own
edges, so the gutter to its neighbour would open and close as the pointer crossed
the column; the grid has to hold still.

The reveal is per **column** rather than per row, because a masonry has no rows —
the tiles in a visual row belong to four different columns, so a row-based
trigger would have to pick one arbitrarily and would fire at four different
scroll positions anyway.

#### Adding or removing a photograph

Both the column assignment and the indices have to be re-derived; neither can be
guessed. The recipe is in the `data/gallery.ts` header: measure the ratio from
the file header, solve the partition (exhaustively up to ~14 tiles), then assign
`index` by sorting every tile by its top edge with ties left to right.

### CTA — original work, adapted from a design reference

**Not in the reference build.** The layout follows a separate design reference —
a closing panel with a text block beside two overlapping cards on a warm
gradient — adapted to this page rather than copied.

What was kept, because it is the composition: the split, the two cards with the
front overlapping the back one's lower-right, both rounded with the front
elevated, and the warm low-contrast ground.

What was changed, because the reference contradicts this page:

| Reference | Here | Why |
|---|---|---|
| Sentence-case serif headline | Uppercase Plus Jakarta Sans 700, `--text-section` | Every heading on this page is the house display voice; Fraunces is an accent face and never a heading |
| Dark rounded pill button | The nav pill's chamfer, extracted as `ChamferButton` | The page already has a button shape. Reusing it makes the overlay's CTA and the closing CTA read as one control |
| Two oil paintings | Two photographs of the café | Every other section shows this café |
| ~20px text link | Same look, 44px hit area | This project's documented interaction floor |

**It also settles a dangling anchor.** The nav overlay has carried a "Visit
OASE" button pointing at `#visit` since the nav was built, and nothing in the
document has ever had that id — so it went nowhere. This section is where that
anchor lands, which is the same win the Gallery recorded for `#gallery`. The
Footer in step 9 takes `id="footer"` so the anchor stays stable.

#### The button is dark, and that is a measured choice

The obvious move was an amber plate, since amber is the palette's accent. It is
the wrong move here, for two reasons:

1. **Contrast.** Cream on ink measures **16.91:1**. The light-ground accent,
   `--color-amber-deep`, measures 4.56:1 — passing, but the primary action on
   the page should not be the weakest text on it.
2. **It anchors the column.** The text side is entirely soft — a 70% ink heading
   and muted body — so a dark plate gives the eye the one hard edge it needs.

The reference agrees: its own button is a dark plate with light type, and so is
the Menu's selected tab. Hover goes to amber with an ink label, which is the same
warm flash the Hero's words use.

#### The front card is not flush to the bottom

Measured off the reference's two paintings against the box they sit in
(529 × 528):

| card | reference | here |
|---|---|---|
| back | 413 × 528 → 78% × 100%, flush top-left | same |
| front | 221 × 215 → 42% × 41%, flush right, **4% clear of the bottom** | same |

The 4% matters. The first attempt was flush to the bottom, and it reads as one
card with a corner bitten out rather than two objects resting on a surface — the
back card has to stay visibly a whole rectangle, with a strip of it showing
beneath the front one. Verified at six widths: 21.8px of back card visible at
1536, 17.9px at 1920.

#### Both assets are stored pre-cropped

```
reading-room.webp   1200 x 1538   ratio 0.7802   back card
in-hand.webp         700 x  683   ratio 1.0249   front card
```

Cropped at build time rather than with `object-position`, so the browser never
has to decide what to cut and the subject is placed deliberately — the cup sits
low in its frame because the card's lower-right corner is the part that overlaps
the back card and would otherwise be hidden.

`1200px` rather than the Gallery's `1600px`, and that is derived: the cluster
caps at 544 layout px, so the back card is at most 424px, which at the 1.25 zoom
ceiling is **530 device px**. 1200px is still 2.3× oversampled there, and the two
files together are 185 KB.

#### The two new photographs, and how they were chosen

Every other photograph on the page is already spoken for — twelve in the Gallery
immediately above, five in Experience, four in Signature, twelve in Menu. Reusing
any would repeat an image within one scroll of itself. So two were added, chosen
to **add subjects rather than restate them**: the set had no reading corner and
no cup in someone's hands.

**Two of the first candidates were rejected for being near-duplicates** — one was
literally the same photograph already used as `gallery/12.webp`, the other
repeated the "CAFE sign" subject of `gallery/01.webp`. This is the second time
this section's assets were caught that way, and the lesson is now recorded in two
places: **inspect the files, do not select on descriptions or ratios.** Both
times the ratios and the balance were fine.

#### The gradient uses two tokens that had no job

`--color-cream-deep` (#f5f1e8) and `--color-surface` (#ece5d8) have been in the
palette since the design system was written and were unused until this section.
They are exactly what the reference's ground is made of: the same warm hue as
`--color-cream`, a step or two down in luminance.

It is a soft radial rather than a linear ramp, so the warmth gathers behind the
cards instead of banding across the full width, and it is light rather than dark:
the page ends on the Gallery's ink, and a second dark section would read as one
long ending. So the nav pill inverts back to ink and the page closes the way it
opened.

#### One value is responsive; everything else is a percentage

```css
.cta-cluster {
  --cta-h: clamp(20rem, calc(0.62 * var(--screen-h)), 34rem);
  width: var(--cta-h);
  aspect-ratio: 1;
}
```

The cluster is a square whose size follows `--screen-h` — not `svh`, for the
reason every other section here uses the token: a raw viewport unit is not
compensated by the page zoom and would overshoot by 25% above 1536. Every card
inside it is then a percentage, so the pair holds the reference's proportions at
every size and this is the only value that has to be responsive at all.

The 0.62 leaves the section its padding at every height, and the `20rem` floor
keeps the cards legible on a short viewport. Measured: section 760 device px in a
900 viewport, 929 in 1080, 671 in 780, and 619 in a 1280 × 720 window — it never
overflows.

#### What was verified

**140 checks, 0 failures**, in a headless Chrome pass:

- **Geometry at six widths** (1280–2560): cluster square and the expected size at
  each, back card exactly 78% × 100%, front exactly 42% × 41%, front flush right
  with a 4.00% bottom gap, cards overlapping, 12px radii, gradient present, grid
  inside the viewport, **zero horizontal overflow**.
- **Fit at seven viewport sizes** including 1280 × 720 and 1920 × 900.
- **Zoom parity**: 1920 × 1125 (zoom 1.25) against 1536 × 900 (zoom 1) — the same
  *layout* size, which is the comparison that means anything — matching to
  **Δ0.00px** on cluster, both cards, grid position and section height.
- **Images**: both load, neither upscaled, ratios true to 0.006.
- **Contrast from the live DOM**, every colour resolved by painting it to a canvas
  and reading back sRGB: heading 6.84:1 and body 6.24:1 against the gradient's
  darkest stop, plate boundary 19.49:1, button label 19.49:1, secondary link
  15.71:1.
- **The anchor**: the overlay's "Visit OASE" scrolls to this section, the heading
  clears the fixed nav, and the overlay closes.
- **Keyboard**: two focusable actions, 56px and 44px hit heights, focus ring
  present, correct `href`s.
- **Reduced motion**: all five animated elements visible at `opacity: 1` with
  **no leftover inline transform**, both actions reachable, both images rendered.
- **Regressions**: Gallery still 4 columns and 12 tiles, Experience 5 panels, the
  wheel 6 cards, no duplicate section ids, and **every nav anchor resolves** —
  `#home #signature #menu #experience #gallery #visit`.

#### Two bugs in the verification itself, worth recording

Both were the same mistake the project already documents, made in the *test*
rather than the code — which is exactly why it is worth writing down:

1. **`getPropertyValue('--screen-h')` returns the unresolved `calc()` string**,
   not a number, so every token assertion read `NaN`. The fix is to put the token
   on a throwaway element and measure it.
2. **The parity check compared 1920 × 900 against 1536 × 900.** Those lay out at
   720 and 900 layout px respectively, so every height-dependent value differed
   by exactly the ratio it should — and the test called it a failure. The valid
   comparison is 1920 × 1125 against 1536 × 900, which are both 1536 × 900 in
   layout px.

The first pass reported 12 failures, none of which were real. **A test that mixes
device px and layout px is the same bug as production code that does**, and it
fails in the same direction: confidently, and by exactly the zoom factor.

---

## Placeholder content

The reference contains no footer, address, opening hours, phone, email or social
handles. Everything under `SITE.visit` in `data/site.ts` is placeholder copy and
must be replaced before launch:

- address, phone, email
- opening hours
- Instagram URL
- **`SITE.visit.maps`** — the CTA's primary button, built from the placeholder
  address above. It is a field rather than derived in the component, so swapping
  the address is one edit instead of a search

The CTA's headline and body copy in `data/cta.ts` are also written placeholder
copy — the reference has no CTA of its own to draw from.
