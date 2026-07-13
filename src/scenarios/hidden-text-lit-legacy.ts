import { runLitLegacyHiddenText } from "./_shared/litLegacyHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy Lit 2.x variant of the hidden-text scenario (Phase 3 robustness, multi-version widening). A
 * `LitElement` custom element renders hidden nodes into its shadow root via the `html` tagged template,
 * built on the previous Lit major (`lit2` npm alias) whose lit-html runtime emits a different internal
 * signature than Lit 3. Lit is bundled locally (no runtime CDN) and imported directly by the driver
 * (a class-to-extend cannot be injected the way jQuery/React/Vue instances are).
 */
export function run(ctx: ScenarioContext): void {
  runLitLegacyHiddenText(ctx);
}
