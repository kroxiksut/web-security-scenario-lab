import type { ScenarioContext } from "./context.ts";
import { runPromptSplitPositive } from "./_shared/promptSplittingDriver.ts";

/**
 * Canonical prompt-splitting positive: an instruction split at word boundaries across consecutive
 * sibling fragments in one region (whitespace between them → boundary-aware / spaced assembly, the
 * eligible higher-confidence case). EN and RU, plus a seeded delayed assembler.
 */
export function run(ctx: ScenarioContext): void {
  runPromptSplitPositive(ctx, { style: "spaced" });
}
