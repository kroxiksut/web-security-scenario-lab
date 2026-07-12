import "./tailwindHiddenText.css";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Tailwind hidden-text behavior (Phase 3 robustness). Unlike the other framework slices,
 * Tailwind is a utility-CSS library with NO JS runtime managing the DOM: the nodes are built with
 * plain DOM calls, but they are hidden via Tailwind utility *classes* from a generated stylesheet
 * rather than inline `style`. This exercises a distinct evasion — a detector that only scans inline
 * `style` attributes would miss it; it must read *computed* style to catch class-based suppression.
 * Class strings are full literals so Tailwind's content scan generates the utilities. NOT unit-tested.
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed via a Tailwind utility class",
  "hidden note (test): Tailwind opacity-0 utility",
  "off-screen smuggled text via Tailwind absolute/left",
  "clipped instruction placeholder via Tailwind sr-only",
];

// Full literal Tailwind class strings (so the content scan picks them up), each hiding a node purely
// through generated utility CSS: transparent, off-screen, tiny font, and the sr-only clip technique.
const HIDDEN_CLASSES = [
  "opacity-0",
  "absolute left-[-9999px]",
  "text-[0.1px]",
  "sr-only",
];

export function runTailwindHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const container = document.createElement("div");
  container.className = "tailwind-hidden-root";

  const baseline = document.createElement("p");
  baseline.textContent = "Tailwind-styled baseline visible text.";
  container.appendChild(baseline);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Inject hidden node (Tailwind)";
  container.appendChild(button);

  const addNode = (): void => {
    const node = document.createElement("p");
    node.className = rng.pick(HIDDEN_CLASSES);
    node.textContent = rng.pick(HIDDEN_SNIPPETS);
    container.insertBefore(node, button);
  };
  button.addEventListener("click", addNode);

  for (let i = 0; i < 3; i += 1) addNode();

  playground.appendChild(container);
}
