import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, resolving Tailwind conflicts.
 *
 * `clsx` flattens conditionals; `twMerge` then makes the LAST value win for any
 * conflicting utility, so a caller's `className` prop reliably overrides a
 * component's own defaults instead of depending on stylesheet order.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}