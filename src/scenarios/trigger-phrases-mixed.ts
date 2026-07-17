import type { ScenarioContext } from "./context.ts";
import { runTriggerPhrases } from "./_shared/triggerPhrasesDriver.ts";

/**
 * Canonical trigger-phrases positive: synthetic prompt-injection phrases planted plainly across
 * visible text and text-bearing attributes, in EN and RU, with a seeded interactive injector.
 * No obfuscation — this is the baseline the detector must catch before any evasion variant.
 */
export function run(ctx: ScenarioContext): void {
  runTriggerPhrases(ctx, { variantTag: "plain" });
}
