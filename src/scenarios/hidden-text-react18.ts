import * as React from "react";
import { createRoot } from "react-dom/client";
import { runReactHiddenText } from "./_shared/reactHiddenText.ts";
import type { ScenarioContext } from "./context.ts";

/**
 * React 18 variant of the hidden-text scenario (Phase 3 robustness). Mounts via the React 18
 * `createRoot` API. React 18 is the root plain dependency; 17/19 are version-isolated nested
 * installs behind Vite aliases (see AI_CONTEXT.md).
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
