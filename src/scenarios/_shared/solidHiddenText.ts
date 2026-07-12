import { render, createComponent } from "solid-js/web";
import SolidHiddenText, { type HiddenNode } from "./solidHiddenText.tsx";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Solid hidden-text behavior (Phase 3 robustness). The JSX component is imported directly (it
 * is compiled by vite-plugin-solid). This driver stays JSX-free by mounting via `createComponent`
 * rather than JSX, so the JSX/compiler surface is confined to the single `.tsx` file. Solid's runtime
 * is fine-grained and signal-driven (no virtual DOM) — another distinct DOM/reactivity signature for
 * the detector. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Solid-reactive subtree",
  "hidden note (test): Solid style binding set opacity ~0",
  "off-screen smuggled text rendered by Solid",
  "clipped instruction placeholder in Solid output",
];

// Each style hides a node purely via a Solid-bound inline style string (framework-managed).
const HIDDEN_STYLES = [
  "opacity:0.02",
  "position:absolute;left:-9999px",
  "font-size:0.1px",
  "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0, 0, 0, 0)",
];

export function runSolidHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const container = document.createElement("div");
  playground.appendChild(container);
  render(() => createComponent(SolidHiddenText, { initial, makeNode }), container);
}
