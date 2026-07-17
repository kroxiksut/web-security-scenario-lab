import type { ScenarioContext } from "./context.ts";
import { runPromptSplitAttributeChain } from "./_shared/promptSplittingDriver.ts";

/**
 * prompt-splitting positive on the attribute-chain axis: one instruction split at word boundaries and
 * hidden across the text-bearing attributes (`title`/`aria-label`/`alt`/`data-note`) of a same-region
 * element chain — the visible text carries only neutral placeholders. A detector scanning visible text
 * sees nothing; one that gathers same-region attribute values in order and space-joins them recovers
 * it. EN and RU, plus a seeded delayed assembler. All logic lives in the shared driver.
 */
export function run(ctx: ScenarioContext): void {
  runPromptSplitAttributeChain(ctx);
}
