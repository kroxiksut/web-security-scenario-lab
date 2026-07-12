import * as React from "react17";
import ReactDOM from "react-dom17";
import { runReactHiddenText } from "./_shared/reactHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * Legacy React 17 variant (Phase 3 robustness). Uses the pre-18 `ReactDOM.render(el, container)`
 * mount API — a genuinely different runtime/commit path than concurrent `createRoot`. Bound to the
 * version-isolated nested install (`react17`/`react-dom17` aliases → frameworks/react/v17) so its
 * react-dom binds React 17, not the root React 18.
 */
export function run(ctx: ScenarioContext): void {
  runReactHiddenText(
    React,
    (element, container) => {
      ReactDOM.render(element, container);
    },
    ctx,
  );
}
