import type { ScenarioContext } from "./context.ts";

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside an open shadow root",
  "hidden note (test): nested shadow DOM smuggled text",
  "off-screen node living in a shadow tree",
  "low-contrast instruction inside encapsulated DOM",
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

function hiddenNode(rng: ScenarioContext["rng"]): HTMLParagraphElement {
  const node = document.createElement("p");
  node.textContent = rng.pick(HIDDEN_SNIPPETS);
  applyTechnique(node, rng.pick(TECHNIQUES));
  return node;
}

/**
 * Shadow-DOM coverage (Phase 3). The hidden content lives inside an OPEN shadow root (and a nested
 * inner shadow root), so a detector must traverse `element.shadowRoot` — not just the light DOM —
 * to see it. Seeded via `ctx.rng`; a button injects more hidden nodes into the shadow tree over time.
 */
export function run({ rng, root }: ScenarioContext): void {
  const host = root.querySelector<HTMLElement>(".shadow-host");
  if (!host) return;

  const shadow = host.attachShadow({ mode: "open" });
  const visible = document.createElement("p");
  visible.textContent = "Visible text rendered inside the shadow root.";
  shadow.append(visible, hiddenNode(rng), hiddenNode(rng));

  // Nested shadow root: hidden content one boundary deeper, to exercise recursive traversal.
  const innerHost = document.createElement("div");
  shadow.appendChild(innerHost);
  const innerShadow = innerHost.attachShadow({ mode: "open" });
  innerShadow.append(hiddenNode(rng));

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Inject hidden node into shadow tree";
  button.addEventListener("click", () => {
    const target = rng.bool() ? shadow : innerShadow;
    const node = hiddenNode(rng);
    if (rng.bool()) window.setTimeout(() => target.appendChild(node), rng.int(0, 400));
    else target.appendChild(node);
  });
  host.insertAdjacentElement("afterend", button);
}
