import Vue from "vue2";
import { runVueLegacyHiddenText } from "./_shared/vueLegacyHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy Vue 2.7 variant (Phase 3 robustness). Bound to the npm-aliased `vue2@npm:vue@2.7.16`
 * instance — an older major with a different virtual-DOM/render format and the `new Vue().$mount`
 * mount model. Vue is bundled locally (no runtime CDN).
 */
export function run(ctx: ScenarioContext): void {
  runVueLegacyHiddenText(Vue, ctx);
}
