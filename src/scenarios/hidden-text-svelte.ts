import { runSvelteHiddenText } from "./_shared/svelteHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Svelte 5 variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Svelte
 * driver, which mounts a compiled Svelte component. Svelte is bundled locally (no runtime CDN) via
 * the Svelte Vite plugin — the first compiler-plugin framework in the lab.
 */
export function run(ctx: ScenarioContext): void {
  runSvelteHiddenText(ctx);
}
