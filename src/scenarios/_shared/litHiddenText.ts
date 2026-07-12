import { LitElement, html } from "lit";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Lit hidden-text behavior (Phase 3 robustness). Lit is a Web Components library: a
 * `LitElement` custom element renders its template into its own **shadow root** by default, so this
 * scenario exercises framework-authored *and* shadow-DOM-encapsulated hidden content in one page
 * (the detector must both cope with a framework runtime and pierce the shadow boundary). Rendered
 * via Lit's `html` tagged template — no JSX/compiler, so no build plugin. Reactivity uses the plain
 * `requestUpdate()` API instead of `@state`/`static properties`, which avoids the class-field vs
 * accessor conflict under `useDefineForClassFields`. NOT unit-tested (scenario behavior).
 *
 * Note: `.button--ghost` lives in the global stylesheet and does not cross the shadow boundary, so
 * the in-element button renders unstyled — irrelevant to the hidden-content signal under test.
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a Lit shadow-root subtree",
  "hidden note (test): Lit template set opacity ~0",
  "off-screen smuggled text rendered by Lit",
  "clipped instruction placeholder in Lit output",
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

const ELEMENT_NAME = "lab-hidden-text";

/** Lit custom element that owns a set of hidden nodes (in its shadow root) and grows it on click. */
class LabHiddenText extends LitElement {
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
      <p>Lit-managed baseline visible text.</p>
      ${this.nodes.map((node) => html`<p style=${node.style}>${node.text}</p>`)}
      <button
        type="button"
        class="button button--ghost"
        style="margin-top:12px"
        @click=${() => this.addNode()}
      >
        Inject hidden node (Lit)
      </button>
    `;
  }
}

export function runLitHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  if (!customElements.get(ELEMENT_NAME)) customElements.define(ELEMENT_NAME, LabHiddenText);

  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(HIDDEN_STYLES) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  const element = document.createElement(ELEMENT_NAME) as LabHiddenText;
  playground.appendChild(element);
  element.seed(makeNode, initial);
}
