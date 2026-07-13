import { LitElement, html } from "lit2";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared legacy-Lit 2.x hidden-text behavior (Phase 3 robustness, multi-version widening). Same
 * shadow-DOM-encapsulated, template-authored hidden content as the Lit 3 slice, but built on the
 * intentionally previous Lit major via the `lit2` npm alias. Lit 2 and Lit 3 share the `LitElement` /
 * `html` / `requestUpdate()` surface used here, but emit a different internal lit-html runtime
 * signature (different template-part markers / update machinery), so library major is a coverage
 * dimension the detector must survive. Lit must be imported directly (a class-to-extend cannot be
 * injected); a distinct element name keeps the v2 and v3 custom elements from colliding if both were
 * ever present. Reactivity uses `requestUpdate()` (not `@state`/`static properties`) to avoid the
 * class-field vs accessor conflict under `useDefineForClassFields`. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a legacy-Lit shadow-root subtree",
  "hidden note (test): Lit 2 template set opacity ~0",
  "off-screen smuggled text rendered by Lit 2",
  "clipped instruction placeholder in Lit 2 output",
];

// Each style hides a node purely via a Lit-set inline style string, so the detector sees
// framework-managed (template-authored) suppression inside a shadow root.
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

const ELEMENT_NAME = "lab-hidden-text-lit2";

/** Legacy-Lit custom element that owns a set of hidden nodes (in its shadow root) and grows it on click. */
class LabHiddenTextLit2 extends LitElement {
  private nodes: HiddenNode[] = [];
  private makeNode: () => HiddenNode = () => ({ text: "", style: "" });

  /** Seed the element from the scenario's rng-picked nodes and a factory for further ones. */
  seed(makeNode: () => HiddenNode, initial: HiddenNode[]): void {
    this.makeNode = makeNode;
    this.nodes = initial;
    this.requestUpdate();
  }

  private addNode(): void {
    this.nodes = [...this.nodes, this.makeNode()];
    this.requestUpdate();
  }

  override render(): unknown {
    return html`
      <p>Lit 2-managed baseline visible text.</p>
      ${this.nodes.map((node) => html`<p style=${node.style}>${node.text}</p>`)}
      <button
        type="button"
        class="button button--ghost"
        style="margin-top:12px"
        @click=${() => this.addNode()}
      >
        Inject hidden node (Lit 2)
      </button>
    `;
  }
}

export function runLitLegacyHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  if (!customElements.get(ELEMENT_NAME)) customElements.define(ELEMENT_NAME, LabHiddenTextLit2);

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const element = document.createElement(ELEMENT_NAME) as LabHiddenTextLit2;
  playground.appendChild(element);
  element.seed(makeNode, initial);
}
