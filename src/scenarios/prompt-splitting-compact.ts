import type { ScenarioContext } from "./context.ts";
import { runPromptSplitPositive } from "./_shared/promptSplittingDriver.ts";

/**
 * Prompt-splitting compact variant: the same instruction split mid-word with no whitespace at the
 * cuts and letter/digit-adjacent boundaries → compact assembly. The detector can reconstruct it but
 * documents compact chains as capped to weak confidence, so this is a lower-confidence positive.
 */
export function run(ctx: ScenarioContext): void {
  runPromptSplitPositive(ctx, { style: "compact" });
}
