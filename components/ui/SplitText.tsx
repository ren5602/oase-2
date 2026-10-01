import { splitIntoChars } from "@/lib/animations";

/**
 * Per-character text reveal primitive.
 *
 * The reference splits headings into bare `<span>`s per letter with no
 * labelling, so a screen reader announces "M A K E" instead of "MAKE". Here the
 * wrapper carries the full string via `aria-label` and the character spans are
 * `aria-hidden`, so assistive tech reads the word normally while the animation
 * still has discrete glyphs to stagger.
 *
 * Words are wrapped in their own `inline-block` so they never break mid-word,
 * and the separating space is left as a real text node so a line can still wrap
 * between words.
 */

type SplitTextProps = {
  text: string;
  className?: string;
  /** Applied to each character span — useful for per-char colour overrides. */
  charClassName?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
};

export default function SplitText({
  text,
  className,
  charClassName,
  as: Tag = "span",
}: SplitTextProps) {
  const words = splitIntoChars(text);

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wordIndex) => (
        <span key={`${word.word}-${wordIndex}`}>
          <span data-word aria-hidden="true" className="inline-block">
            {word.chars.map((char, charIndex) => (
              <span
                key={`${char}-${charIndex}`}
                data-char
                className={charClassName}
              >
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
