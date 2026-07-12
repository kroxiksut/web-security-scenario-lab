import type * as ReactNS from "react";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared React-driven hidden-text behavior (Phase 3 robustness). React and a `mount` callback are
 * injected as params so the SAME driver runs on multiple pinned React versions with different mount
 * APIs — React 17 `ReactDOM.render(el, container)` vs React 18/19 `createRoot(container).render(el)`
 * (mirrors the jQuery driver's param injection). Uses `createElement` (no JSX) — the lab only needs
 * React to *manage the DOM*, so we avoid a JSX build plugin and keep multi-version resolution
 * simple. NOT unit-tested.
 */

/** Version-agnostic mount: render a root element into a freshly-created container. */
export type ReactMount = (element: ReactNS.ReactElement, container: HTMLElement) => void;

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a React-managed subtree",
  "hidden note (test): React inline style set opacity ~0",
  "off-screen smuggled text rendered by React",
  "clipped instruction placeholder in React output",
];

// Each style hides a node purely via React-set inline style, so the detector sees framework-managed
// (virtual-DOM-authored) suppression rather than hand-written DOM mutation.
function hiddenStyles(): ReactNS.CSSProperties[] {
  return [
    { opacity: 0.02 },
    { position: "absolute", left: "-9999px" },
    { fontSize: "0.1px" },
    { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" },
  ];
}

interface HiddenNode {
  text: string;
  style: ReactNS.CSSProperties;
}

/** Render a React component that owns a set of hidden nodes and grows it on click. Seeded via rng. */
export function runReactHiddenText(
  React: typeof ReactNS,
  mount: ReactMount,
  { rng, root }: ScenarioContext,
): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const styles = hiddenStyles();
  const makeNode = (): HiddenNode => ({ text: rng.pick(HIDDEN_SNIPPETS), style: rng.pick(styles) });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  function HiddenText(): ReactNS.ReactElement {
    const [nodes, setNodes] = React.useState<HiddenNode[]>(initial);
    return React.createElement(
      "div",
      { className: "react-hidden-root" },
      React.createElement("p", null, "React-managed baseline visible text."),
      ...nodes.map((node, i) =>
        React.createElement("p", { key: i, style: node.style }, node.text),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          className: "button button--ghost",
          style: { marginTop: "12px" },
          onClick: () => {
            setNodes((prev) => [...prev, makeNode()]);
          },
        },
        "Inject hidden node (React)",
      ),
    );
  }

  const container = document.createElement("div");
  playground.appendChild(container);
  mount(React.createElement(HiddenText), container);
}
