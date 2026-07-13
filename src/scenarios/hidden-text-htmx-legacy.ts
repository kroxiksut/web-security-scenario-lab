import htmx from "htmx1";
import { runHtmxHiddenText } from "./_shared/htmxHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy htmx 1.x variant of the hidden-text scenario (Phase 3 robustness, multi-version widening).
 * Reuses the shared htmx driver unchanged — the `hx-get` / `hx-swap` / `hx-trigger` swap model is the
 * same across htmx 1 and 2, so the driver only needs the `process` method both majors expose. htmx 1.x
 * is a deliberately stale major (still deployed on long-lived sites); its own (pre-2.x) ajax/swap
 * runtime is a different signature the detector must survive. Bundled locally via the `htmx1` npm alias
 * (no runtime CDN); the swapped fragment is the same static server file used by the htmx 2 slice.
 */
export function run(ctx: ScenarioContext): void {
  runHtmxHiddenText(htmx, ctx);
}
