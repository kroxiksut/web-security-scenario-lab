import type { ScenarioContext } from "./context.ts";
import { runPromptSplitAttributeBenign } from "./_shared/promptSplittingDriver.ts";

/**
 * Benign false-positive control for the prompt-splitting attribute-chain axis (`shouldFire: false`).
 *
 * Same attribute-chain shape as the positive — fragments spread across `title`/`aria-label`/`alt`/
 * `data-note` of a same-region chain — but the assembled attribute values are ordinary UI tooltip
 * copy, not an instruction. Reconstructing an attribute chain is not itself a signal; only a
 * reconstructed instruction is. The module must stay silent, guarding the attribute axis against
 * false positives (the counterpart to the text-axis benign control). Logic lives in the shared driver.
 */
export function run(ctx: ScenarioContext): void {
  runPromptSplitAttributeBenign(ctx);
}
