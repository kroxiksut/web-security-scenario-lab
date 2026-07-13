import type { ScenarioContext } from "../context.ts";

/**
 * Shared legacy-Alpine 2.x hidden-text behavior (Phase 3 robustness, multi-version widening). Same
 * attribute-driven, directive-authored hidden content as the Alpine 3 slice, but on the intentionally
 * previous Alpine major (`alpine2` npm alias). Two runtime differences make this a distinct signature
 * the detector must survive:
 *  - **Init model:** Alpine 2's dist auto-starts on import and installs a live MutationObserver that
 *    initializes any `x-data` subtree added afterwards — so this driver just injects markup and does
 *    NOT call `start()` (the Alpine 3 slice registers then calls `Alpine.start()` explicitly).
 *  - **Style binding:** Alpine 2 does not object-bind `:style` (only `:class`), so nodes are hidden via
 *    a `:style` **string** expression rather than the object binding used in the Alpine 3 slice.
 * The intentionally messy directive markup is a feature (real Alpine pages look like this). Alpine is
 * imported for its start-on-load side effect by the behavior module. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a legacy-Alpine reactive subtree",
  "hidden note (test): Alpine 2 :style binding set opacity ~0",
  "off-screen smuggled text bound by Alpine 2",
  "clipped instruction placeholder in Alpine 2 output",
];

// Alpine 2 binds `:style` as a string (no object binding), so each entry is a CSS declaration string.
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

/** Inject an Alpine 2 `x-data` subtree that owns hidden nodes and grows it on click. Seeded via rng. */
export function runAlpineLegacyHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);
  // A seeded pool the Alpine `add()` expression draws from (Alpine expressions can't reach our rng).
  const pool: HiddenNode[] = HIDDEN_SNIPPETS.map((text, i) => ({
    text,
    style: HIDDEN_STYLES[i % HIDDEN_STYLES.length] as string,
  }));

  const container = document.createElement("div");
  // setAttribute (not innerHTML) carries the JSON payload verbatim — no HTML-escaping needed.
  container.setAttribute(
    "x-data",
    `{ nodes: ${JSON.stringify(initial)}, pool: ${JSON.stringify(pool)},` +
      ` add() { this.nodes.push(this.pool[this.nodes.length % this.pool.length]); } }`,
  );
  container.innerHTML = `
    <p>Alpine 2-managed baseline visible text.</p>
    <template x-for="(node, i) in nodes" :key="i">
      <p :style="node.style" x-text="node.text"></p>
    </template>
    <button type="button" class="button button--ghost" style="margin-top:12px" @click="add()">
      Inject hidden node (Alpine 2)
    </button>`;
  playground.appendChild(container);

  // No explicit start(): Alpine 2 auto-started on import and its live observer initializes this subtree.
}
