import * as preact from "preact";
import * as hooks from "preact/hooks";
import { runPreactHiddenText } from "./_shared/preactHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Preact 10 variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Preact
 * driver with the pinned Preact runtime, rendered via `h` + `render` (no JSX). Preact is bundled
 * locally (no runtime CDN) and self-contained, so — like Vue — a future multi-version pass can use
 * npm aliases directly without a nested install.
 */
export function run(ctx: ScenarioContext): void {
  runPreactHiddenText(preact, hooks, ctx);
}
