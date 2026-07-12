import { runTailwindHiddenText } from "./_shared/tailwindHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Tailwind variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Tailwind
 * driver. Tailwind is a utility-CSS library (no JS DOM runtime): nodes are hidden via generated
 * utility classes rather than inline styles. The generated stylesheet is bundled locally (no runtime
 * CDN) and scoped to this scenario's chunk.
 */
export function run(ctx: ScenarioContext): void {
  runTailwindHiddenText(ctx);
}
