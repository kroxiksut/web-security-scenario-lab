import Alpine from "alpinejs";
import { runAlpineHiddenText } from "./_shared/alpineHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Alpine.js variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Alpine
 * driver, which declares the hidden nodes through Alpine directives and starts the runtime. Alpine is
 * bundled locally (no runtime CDN) and self-contained, so a future multi-version pass can use a plain
 * npm alias.
 */
export function run(ctx: ScenarioContext): void {
  runAlpineHiddenText(Alpine, ctx);
}
