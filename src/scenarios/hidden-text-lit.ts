import { runLitHiddenText } from "./_shared/litHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Lit variant of the hidden-text scenario (Phase 3 robustness). A `LitElement` custom element renders
 * hidden nodes into its shadow root via the `html` tagged template. Lit is bundled locally (no runtime
 * CDN) and self-contained; the driver imports it directly because the element must extend `LitElement`
 * at module load (a class-to-extend cannot be injected the way jQuery/React/Vue instances are).
 */
export function run(ctx: ScenarioContext): void {
  runLitHiddenText(ctx);
}
