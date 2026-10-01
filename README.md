# OASE

A production-quality café website for **OASE — Coffee & Calm**, rebuilt natively
in Next.js from a Framer reference (`altruistic-pitch-532973.framer.app`). No
Framer runtime, no iframe, no embedded frames — the design and motion language
are reimplemented from scratch.

> **Status: Step 5 of 9 complete.** Navbar, Hero, Signature, Menu and
> Experience are built. See [Build order](#build-order) below.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with a CSS-variable design system |
| Motion | GSAP 3 + ScrollTrigger (installed, not yet used) |
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

## Desktop only

The reference ships `<meta name="viewport" content="width=1440">` and a fixed
`1440 × 11286px` canvas with **zero media queries**. There is no responsive
design to port and none was invented.

This build targets desktop only. **There are no mobile or tablet breakpoints.**
`clamp()` and `vw` are used solely so the desktop layout interpolates cleanly
across **1280 / 1440 / 1600 / 1920**. Primary comparison viewport: **1440 × 900**.

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
Experience, Bean to Cup, Gallery, CTA and Footer do not exist in it, so those
will be original work in the same visual language.

### Extracted tokens

| Token | Value | Origin |
|---|---|---|
| `--color-cream` | `#fefefc` | reference `rgb(254,255,252)` |
| `--color-ink` | `#0b0b0b` | reference foreground |
| `--color-coffee` | `#76453b` | reference hero background |
| `--color-coffee-deep` | `#59342c` | reference card-description colour |
| `--color-amber` | `#e39f01` | reference `rgb(227,159,1)` hero accent |
| `--color-coffee-dark` | `#2a1712` | deeper tone for dark surfaces |

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
  experience/Experience.tsx  pinned horizontal strip
  ui/SplitText.tsx        per-character reveal primitive (aria-safe)

data/
  site.ts                 nav labels, tagline, location, hours, contact
  signature.ts            panel offsets, phase boundaries, geometry
  menu.ts                 drinks + foods items, categories, price format
  experience.ts           the five moments, true aspect ratios

lib/
  useSectionTheme.ts      IntersectionObserver -> which theme is under the nav
  scrollLock.ts           page scroll lock while the overlay is open
  animations.ts           shared easing / duration / reveal tokens,
                          incl. the critically damped text-reveal ease
  fanLayout.ts            fan slot geometry (scale / rotate / translate)
```

Content is kept separate from presentation. Nothing in `components/` hardcodes a
menu item or a contact detail.

---

## Implementation notes

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
| 6 | Bean to Cup | ⬜ not started |
| 7 | Gallery | ⬜ not started |
| 8 | CTA | ⬜ not started |
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

The section is `min-h-[100svh]` with a flex column, so it occupies exactly one
viewport. The reference has no such constraint — it ships two separate 900px
sections, so the pacing problem never arises.

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
--u: clamp(0.55px, calc((100svh - 379px) / 476), 1px);
```

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

Vertical scroll drives horizontal travel. The section is pinned for the length
of the strip's overflow and the track is translated by the same distance with
`scrub`, so one scroll position maps to exactly one horizontal offset — there is
no second scrollbar to fall out of sync.

The distance is read from the track's **live `scrollWidth`** inside a function
rather than hardcoded, so adding or removing a panel lengthens the pin
automatically instead of clipping the last one, and `invalidateOnRefresh`
re-measures after fonts and images settle.

`pin: true` with `pinSpacing` left on, which differs from Signature's approach
deliberately: Signature uses CSS `position: sticky` because its stage is
followed by content that needs to sit against it, whereas here GSAP's
pin-spacer is what guarantees the document is the correct total height while
pinned.

**The rhythm is the photographs' own.** Each panel is given the same *height*
and its width follows from `aspect-ratio`, so the strip alternates narrow and
wide purely because the source images do. A fixed width would have flattened
that into a grid.

**Viewport fitting came free this time.** Everything derives from one token,
`--exp-img-h: clamp(200px, 58svh, 620px)`, so a short viewport shrinks the
photographs rather than pushing the section past the fold. Measured fit at
1280/1440/1600 × 900, 1920 × 1080, and down to 1280 × 650.

Under reduced motion there is no pin and no translation — but the strip becomes
a **native horizontal scroller**, which matters: without it the track would
simply overflow and the later panels would be permanently unreachable. The
reduced-motion path loses motion, not content.

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
overflowed.

The fix ties the type back to the panel rather than the viewport:

```css
.exp-panel__meta   { container-type: inline-size; }
.exp-panel__title  { font-size: min(clamp(1.375rem, 1.9vw, 1.875rem), 7.2cqi); }
```

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

---

## Placeholder content

The reference contains no footer, address, opening hours, phone, email or social
handles. Everything under `SITE.visit` in `data/site.ts` is placeholder copy and
must be replaced before launch:

- address, phone, email
- opening hours
- Instagram URL
