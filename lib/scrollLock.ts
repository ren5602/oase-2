/**
 * Scroll lock for the nav overlay.
 *
 * Deliberately imperative and module-scoped rather than React state: the
 * overlay needs the page behind it frozen, and a re-render is the wrong tool
 * for that. Restoring the previous value rather than clearing it means a
 * lock/unlock cycle cannot clobber an inline style set elsewhere.
 */

let previousOverflow: string | null = null;
let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  if (lockCount > 1) return;

  const root = document.documentElement;
  previousOverflow = root.style.overflow;
  root.style.overflow = "hidden";
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.style.overflow = previousOverflow ?? "";
  previousOverflow = null;
}
