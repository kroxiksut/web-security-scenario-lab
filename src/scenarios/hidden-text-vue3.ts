import * as Vue from "vue";
import { runVueHiddenText } from "./_shared/vueHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Vue 3 variant of the hidden-text scenario (Phase 3 robustness). Delegates to the shared Vue
 * driver with the pinned Vue 3 runtime, mounted via `createApp`. Vue is bundled locally (no runtime
 * CDN) and self-contained, so unlike React a future multi-version pass can use npm aliases directly.
 */
export function run(ctx: ScenarioContext): void {
  runVueHiddenText(Vue, ctx);
}
