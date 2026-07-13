// Side-effect import: Alpine 2's dist auto-starts on load and installs a live MutationObserver that
// initializes the x-data subtree the driver injects (Alpine 2's init model — no explicit start()).
import "alpine2";
import { runAlpineLegacyHiddenText } from "./_shared/alpineLegacyHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy Alpine 2.x variant of the hidden-text scenario (Phase 3 robustness, multi-version widening).
 * Delegates to the shared legacy-Alpine driver, which declares the hidden nodes through Alpine
 * directives. Built on the previous Alpine major (`alpine2` npm alias) whose auto-start init model and
 * string `:style` binding differ from Alpine 3 — a distinct runtime signature. Bundled locally (no CDN).
 */
export function run(ctx: ScenarioContext): void {
  runAlpineLegacyHiddenText(ctx);
}
