import type { ScenarioContext } from "./context.ts";
import { runTriggerPhrases } from "./_shared/triggerPhrasesDriver.ts";
import { insertZeroWidth, toFullwidth } from "./_shared/textEvasion.ts";

/**
 * Trigger-phrases evasion variant: the same synthetic phrases, but each obfuscated with a Unicode
 * trick (zero-width insertion or fullwidth folding, seeded per phrase). A naive substring check
 * misses them; a detector applying NFC/NFKC + control-character normalization — as PageCheck's
 * trigger-phrases module documents — should recover the underlying phrase and still fire.
 */
export function run(ctx: ScenarioContext): void {
  runTriggerPhrases(ctx, {
    variantTag: "unicode-evasion",
    transform: (text, rng) => (rng.bool() ? insertZeroWidth(text) : toFullwidth(text)),
  });
}
