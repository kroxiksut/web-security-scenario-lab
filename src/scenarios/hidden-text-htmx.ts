import htmx from "htmx.org";
import { runHtmxHiddenText } from "./_shared/htmxHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * htmx variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared htmx driver,
 * which sets up an `hx-get` that swaps a static hidden-content fragment into the page. htmx is bundled
 * locally (no runtime CDN); the fragment is a static file served by the same trivial static server,
 * keeping the lab backend-free.
 */
export function run(ctx: ScenarioContext): void {
  runHtmxHiddenText(htmx, ctx);
}
