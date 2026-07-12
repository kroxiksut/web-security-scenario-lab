import $ from "jquery1";
import { runJqueryHiddenText } from "./_shared/jqueryHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy jQuery 1.12 variant (Phase 3 robustness). Same driver as the 3.7 page, but bound to the
 * npm-aliased `jquery1@npm:jquery@1.12.4` instance — an intentionally stale, widely-deployed major
 * with a different DOM/animation signature the detector must still handle. Pin is deliberate and
 * NOT auto-updated; the deprecation warning is expected (legacy is the point).
 */
export function run(ctx: ScenarioContext): void {
  runJqueryHiddenText($, ctx);
}
