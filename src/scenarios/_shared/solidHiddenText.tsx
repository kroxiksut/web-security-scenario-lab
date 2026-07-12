import { createSignal, For } from "solid-js";

/**
 * Solid hidden-text component (Phase 3 robustness). Authored in JSX and compiled by vite-plugin-solid
 * into Solid's fine-grained reactive runtime (no virtual DOM; updates flow through signals). This is
 * the lab's JSX-compiler pipeline (distinct from Svelte's compiler). The suppressed nodes are authored
 * by the component and hidden via a Solid-bound inline `style` string, so the detector sees
 * framework-managed suppression. NOT unit-tested (scenario behavior).
 */

export interface HiddenNode {
  text: string;
  style: string;
}

export default function SolidHiddenText(props: {
  initial: HiddenNode[];
  makeNode: () => HiddenNode;
}) {
  const [nodes, setNodes] = createSignal<HiddenNode[]>(props.initial);
  return (
    <div class="solid-hidden-root">
      <p>Solid-managed baseline visible text.</p>
      <For each={nodes()}>{(node) => <p style={node.style}>{node.text}</p>}</For>
      <button
        type="button"
        class="button button--ghost"
        style="margin-top: 12px"
        onClick={() => setNodes((prev) => [...prev, props.makeNode()])}
      >
        Inject hidden node (Solid)
      </button>
    </div>
  );
}
