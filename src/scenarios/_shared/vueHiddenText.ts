import type * as VueNS from "vue";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Vue 3 hidden-text behavior (Phase 3 robustness). The Vue module is injected as a param
 * (same shape as the jQuery/React drivers) so a future pinned Vue version can reuse it. Uses render
 * functions (`h`) + `createApp` — no SFCs, so the lab needs no `@vitejs/plugin-vue`. The lab only
 * needs Vue to *manage the DOM*. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Vue-managed subtree",
  "hidden note (test): Vue style binding set opacity ~0",
  "off-screen smuggled text rendered by Vue",
  "clipped instruction placeholder in Vue output",
];

// Each style hides a node purely via a Vue style binding, so the detector sees framework-managed
// (render-function-authored) suppression rather than hand-written DOM mutation.
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

/** Mount a Vue app that owns a set of hidden nodes and grows it reactively on click. Seeded via rng. */
export function runVueHiddenText(Vue: typeof VueNS, { rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const { createApp, h, ref } = Vue;
  const makeNode = (): HiddenNode => ({
    text: rng.pick(HIDDEN_SNIPPETS),
    style: rng.pick(HIDDEN_STYLES),
  });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const App = {
    setup() {
      const nodes = ref<HiddenNode[]>(initial);
      return () =>
        h("div", { class: "vue-hidden-root" }, [
          h("p", null, "Vue-managed baseline visible text."),
          ...nodes.value.map((node, i) => h("p", { key: i, style: node.style }, node.text)),
          h(
            "button",
            {
              type: "button",
              class: "button button--ghost",
              style: { marginTop: "12px" },
              onClick: () => {
                nodes.value = [...nodes.value, makeNode()];
              },
            },
            "Inject hidden node (Vue)",
          ),
        ]);
    },
  };

  const container = document.createElement("div");
  playground.appendChild(container);
  createApp(App).mount(container);
}
