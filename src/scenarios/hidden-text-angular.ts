import { runAngularHiddenText } from "./_shared/angularHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Angular variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Angular
 * driver, which bootstraps an AOT-compiled standalone component (Ivy runtime, zoneless signals, DI).
 * Angular is bundled locally (no runtime CDN) — the lab's heaviest framework and its only
 * decorator/DI-based component model.
 */
export function run(ctx: ScenarioContext): void {
  runAngularHiddenText(ctx);
}
