import type { ScenarioContext } from "../context.ts";

/**
 * Shared Alpine.js hidden-text behavior (Phase 3 robustness). Alpine is an attribute-driven runtime:
 * behavior is declared in `x-data` / `x-for` / `:style` / `@click` attributes on the markup, and
 * Alpine walks the DOM and wires it up on `start()`. So the suppressed nodes here are authored and
 * hidden **declaratively via Alpine directives** (an `:style` object binding), not by imperative DOM
 * calls — the detector must fire on Alpine-managed reactive DOM. The intentionally messy directive
 * markup is a feature (real Alpine pages look like this). Alpine is injected as a param (same shape as
 * the other drivers) so a future pinned version can reuse it. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside an Alpine-reactive subtree",
  "hidden note (test): Alpine :style binding set opacity ~0",
  "off-screen smuggled text bound by Alpine",
  "clipped instruction placeholder in Alpine output",
];

// Kebab-case CSS keys: Alpine's object `:style` binding applies values via `style.setProperty`,
// which expects CSS property names. Each entry hides a node purely through the Alpine binding.
const HIDDEN_STYLES: Array<Record<string, string>> = [
  { opacity: "0.02" },
  { position: "absolute", left: "-9999px" },
  { "font-size": "0.1px" },
  { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" },
];

interface HiddenNode {
  text: string;
  style: Record<string, string>;
}

/** Mount an Alpine-driven subtree that owns hidden nodes and grows it reactively on click. Seeded via rng. */
export function runAlpineHiddenText(
  alpine: typeof import("alpinejs"),
  { rng, root }: ScenarioContext,
): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);
  // A seeded pool the Alpine `add()` expression draws from (Alpine expressions can't reach our rng).
  const pool: HiddenNode[] = HIDDEN_SNIPPETS.map((text, i) => ({
    text,
    style: HIDDEN_STYLES[i % HIDDEN_STYLES.length] as Record<string, string>,
  }));

  const container = document.createElement("div");
  // setAttribute (not innerHTML) carries the JSON payload verbatim — no HTML-escaping needed.
  container.setAttribute(
    "x-data",
    `{ nodes: ${JSON.stringify(initial)}, pool: ${JSON.stringify(pool)},` +
      ` add() { this.nodes.push(this.pool[this.nodes.length % this.pool.length]); } }`,
  );
  container.innerHTML = `
    <p>Alpine-managed baseline visible text.</p>
    <template x-for="(node, i) in nodes" :key="i">
      <p :style="node.style" x-text="node.text"></p>
    </template>
    <button type="button" class="button button--ghost" style="margin-top:12px" @click="add()">
      Inject hidden node (Alpine)
    </button>`;
  playground.appendChild(container);

  // Canonical module-build wiring: expose Alpine globally (devtools/plugins) then start it. start()
  // walks the document once and processes the directives on the just-appended subtree.
  (window as Window & { Alpine?: typeof alpine }).Alpine = alpine;
  alpine.start();
}
