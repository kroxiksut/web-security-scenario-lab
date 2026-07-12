import $ from "jquery";
import { runJqueryHiddenText } from "./_shared/jqueryHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * jQuery 3.7 variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared
 * jQuery driver with the pinned 3.7 instance; the framework is bundled locally (no runtime CDN).
 */
export function run(ctx: ScenarioContext): void {
  runJqueryHiddenText($, ctx);
}
