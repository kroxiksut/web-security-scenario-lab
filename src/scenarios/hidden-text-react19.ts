import * as React from "react19";
import { createRoot } from "react-dom19/client";
import { runReactHiddenText } from "./_shared/reactHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * React 19 variant (Phase 3 robustness). Uses the `createRoot` API from the version-isolated nested
 * install (`react19`/`react-dom19` aliases → frameworks/react/v19), so its react-dom binds React
 * 19, not the root React 18. Exercises the newest reconciler against the detector.
 */
export function run(ctx: ScenarioContext): void {
  runReactHiddenText(
    React,
    (element, container) => {
      createRoot(container).render(element);
    },
    ctx,
  );
}
