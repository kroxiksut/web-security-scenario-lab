import type { ScenarioContext } from "../context.ts";

/**
 * Shared Vue 2.7 hidden-text behavior (Phase 3 robustness). Separate from the Vue 3 driver because
 * Vue 2's render `h` uses a different data format (`{ attrs, on, style }`) and the app is created
 * via `new (Vue.extend(...))().$mount(...)` rather than `createApp`. The Vue constructor is injected
 * as a param (mirrors the other drivers). Vue 2 is self-contained, so it needs only a root npm
 * alias (no nested install). NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Vue 2-managed subtree",
  "hidden note (test): Vue 2 style binding set opacity ~0",
  "off-screen smuggled text rendered by Vue 2",
  "clipped instruction placeholder in Vue 2 output",
];

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

/** Mount a Vue 2 app that owns a set of hidden nodes and grows it reactively on click. Seeded via rng. */
export function runVueLegacyHiddenText(
  Vue: typeof import("vue2").default,
  { rng, root }: ScenarioContext,
): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({
    text: rng.pick(HIDDEN_SNIPPETS),
    style: rng.pick(HIDDEN_STYLES),
  });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const Component = Vue.extend({
    data(): { nodes: HiddenNode[] } {
      return { nodes: initial };
    },
    methods: {
      injectNode(): void {
        // Vue 2 patches Array.prototype.push, so this mutation is reactive.
        this.nodes.push(makeNode());
      },
    },
    render(h) {
      return h("div", { class: "vue-hidden-root" }, [
        h("p", "Vue 2-managed baseline visible text."),
        ...this.nodes.map((node, i) => h("p", { key: i, style: node.style }, node.text)),
        h(
          "button",
          {
            attrs: { type: "button" },
            class: "button button--ghost",
            style: { marginTop: "12px" },
            on: { click: this.injectNode },
          },
          "Inject hidden node (Vue 2)",
        ),
      ]);
    },
  });

  const container = document.createElement("div");
  playground.appendChild(container);
  new Component().$mount(container);
}
