import type { ScenarioContext } from "./context.ts";

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: this line is visually suppressed",
  "hidden note (test): reviewer should not see this",
  "off-screen smuggled text sample for detector testing",
  "low-contrast injected instruction placeholder",
];

const TECHNIQUES = ["opacity", "offscreen", "clip", "tiny"] as const;
type Technique = (typeof TECHNIQUES)[number];

function applyTechnique(el: HTMLElement, technique: Technique): void {
  switch (technique) {
    case "opacity":
      el.style.opacity = "0.02";
      break;
    case "offscreen":
      el.style.position = "absolute";
      el.style.left = "-9999px";
      break;
    case "clip":
      el.style.position = "absolute";
      el.style.clip = "rect(0, 0, 0, 0)";
      break;
    case "tiny":
      el.style.fontSize = "0.1px";
      break;
  }
}

/**
 * Seeded, interactive hidden-text scenario. Fills the pre-existing hidden nodes with rotating
 * suspicious text (reproducible per seed) and adds a button whose effect varies each click —
 * exactly the kind of event-driven, timed DOM mutation the detector must survive.
 */
export function run({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  playground
    .querySelectorAll<HTMLElement>(".vm-hidden-opacity, .vm-offscreen, .vm-clipped")
    .forEach((el) => {
      el.textContent = rng.pick(HIDDEN_SNIPPETS);
    });

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Inject hidden node";
  button.addEventListener("click", () => {
    const node = document.createElement("p");
    node.textContent = rng.pick(HIDDEN_SNIPPETS);
    applyTechnique(node, rng.pick(TECHNIQUES));
    const delay = rng.int(0, 500);
    if (rng.bool()) window.setTimeout(() => playground.appendChild(node), delay);
    else playground.appendChild(node);
  });
  playground.insertAdjacentElement("afterend", button);
}
