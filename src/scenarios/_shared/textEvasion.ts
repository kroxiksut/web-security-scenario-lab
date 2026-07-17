/**
 * Text-obfuscation helpers for evasion scenarios.
 *
 * These reproduce Unicode tricks that hide a trigger phrase from a naive substring check while a
 * detector that applies Unicode normalization (NFC/NFKC) and control-character folding — as
 * PageCheck's trigger-phrases module documents — should still recover the underlying phrase. They
 * are a distinct concern from the phrase data itself (`triggerCorpus.ts`) and are reused wherever a
 * scenario needs a normalization-evasion variant.
 */

/** Zero-width space (U+200B); stripped by control/format-character normalization. */
const ZERO_WIDTH_SPACE = "​";

/**
 * Insert a zero-width space between each pair of non-space characters. The rendered text looks
 * unchanged to a human, but a raw `includes()` of the original phrase fails; a detector that folds
 * zero-width/format characters recovers the phrase.
 */
export function insertZeroWidth(text: string): string {
  const chars = Array.from(text);
  return chars
    .map((ch, i) => {
      const next = chars[i + 1];
      const joiner = next && ch !== " " && next !== " " ? ZERO_WIDTH_SPACE : "";
      return ch + joiner;
    })
    .join("");
}

/**
 * Map ASCII letters, digits, and punctuation to their Unicode "fullwidth" forms (U+FF01–U+FF5E),
 * and space to the ideographic space (U+3000). NFKC normalization folds these back to plain ASCII,
 * so a normalizing detector recovers the phrase while a naive check sees different code points.
 */
export function toFullwidth(text: string): string {
  return Array.from(text)
    .map((ch) => {
      if (ch === " ") return "　";
      const code = ch.codePointAt(0);
      if (code !== undefined && code >= 0x21 && code <= 0x7e) {
        return String.fromCodePoint(code - 0x21 + 0xff01);
      }
      return ch;
    })
    .join("");
}
