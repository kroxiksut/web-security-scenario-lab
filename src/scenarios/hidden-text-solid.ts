import { runSolidHiddenText } from "./_shared/solidHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Solid variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Solid
 * driver, which mounts a JSX component compiled by vite-plugin-solid. Solid is bundled locally (no
 * runtime CDN) — the lab's JSX-compiler-pipeline framework.
 */
export function run(ctx: ScenarioContext): void {
  runSolidHiddenText(ctx);
}
