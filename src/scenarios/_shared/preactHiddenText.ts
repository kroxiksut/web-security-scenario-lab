import type * as PreactNS from "preact";
import type * as PreactHooksNS from "preact/hooks";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Preact hidden-text behavior (Phase 3 robustness). The Preact core (`h`/`render`) and the
 * hooks module (`useState`) are injected as params (same shape as the jQuery/React/Vue drivers) so a
 * future pinned Preact version can reuse it. Preact is a distinct ~3 kB virtual-DOM runtime with its
 * own reconciler; rendering via `h` (no JSX) keeps the lab free of a JSX build plugin. The lab only
 * needs Preact to *manage the DOM*. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Preact-managed subtree",
  "hidden note (test): Preact inline style set opacity ~0",
  "off-screen smuggled text rendered by Preact",
  "clipped instruction placeholder in Preact output",
];

// Each style hides a node purely via a Preact-set inline style, so the detector sees framework-managed
// (virtual-DOM-authored) suppression rather than hand-written DOM mutation.
const HIDDEN_STYLES: Array<Record<string, string>> = [
  { opacity: "0.02" },
  { position: "absolute", left: "-9999px" },
  { fontSize: "0.1px" },
  { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" },
];

interface HiddenNode {
  text: string;
  style: Record<string, string>;
}

/** Render a Preact component that owns a set of hidden nodes and grows it reactively on click. Seeded via rng. */
export function runPreactHiddenText(
  preact: typeof PreactNS,
  hooks: typeof PreactHooksNS,
  { rng, root }: ScenarioContext,
): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const { h, render } = preact;
  const { useState } = hooks;
  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  function HiddenText() {
    const [nodes, setNodes] = useState<HiddenNode[]>(initial);
    return h(
      "div",
      { class: "preact-hidden-root" },
      h("p", null, "Preact-managed baseline visible text."),
      ...nodes.map((node, i) => h("p", { key: i, style: node.style }, node.text)),
      h(
        "button",
        {
          type: "button",
          class: "button button--ghost",
          style: { marginTop: "12px" },
          onClick: () => {
            setNodes((prev) => [...prev, makeNode()]);
          },
        },
        "Inject hidden node (Preact)",
      ),
    );
  }

  const container = document.createElement("div");
  playground.appendChild(container);
  render(h(HiddenText, null), container);
}
