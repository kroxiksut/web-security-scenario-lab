import { mount } from "svelte";
import SvelteHiddenText from "./svelteHiddenText.svelte";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Svelte 5 hidden-text behavior (Phase 3 robustness). Like Lit, the component is imported
 * directly (it is compiled by the Svelte Vite plugin at build time, so there is no runtime instance
 * to inject). Svelte compiles to a fine-grained runtime with no virtual DOM — a different DOM and
 * reactivity signature than React/Vue/Preact — which the detector must also handle. The suppressed
 * nodes are authored by the component and hidden via a Svelte-bound inline style. NOT unit-tested.
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Svelte-compiled subtree",
  "hidden note (test): Svelte style binding set opacity ~0",
  "off-screen smuggled text rendered by Svelte",
  "clipped instruction placeholder in Svelte output",
];

// Each style hides a node purely via a Svelte-bound inline style string (framework-managed).
const HIDDEN_STYLES = [
  "opacity:0.02",
  "position:absolute;left:-9999px",
  "font-size:0.1px",
  "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0, 0, 0, 0)",
];

interface HiddenNode {
  text: string;
  style: string;
}

export function runSvelteHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const container = document.createElement("div");
  playground.appendChild(container);
  mount(SvelteHiddenText, { target: container, props: { initial, makeNode } });
}
