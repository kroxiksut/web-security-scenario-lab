import type { ScenarioContext } from "./context.ts";

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside a same-origin iframe",
  "hidden note (test): smuggled text in a child frame",
  "off-screen node living in an iframe document",
  "low-contrast instruction inside a nested browsing context",
];

// srcdoc gives the child frame a same-origin (about:srcdoc) document, so a content script can reach
// contentDocument. The hidden nodes carry inline suppression identical to the light-DOM scenario.
function buildSrcdoc(rng: ScenarioContext["rng"]): string {
  const pick = (): string => rng.pick(HIDDEN_SNIPPETS);
  return [
    "<!doctype html><html><head><meta charset='utf-8'></head><body>",
    "<p>Visible baseline text inside the iframe.</p>",
    `<p style="opacity:0.02">${pick()}</p>`,
    `<p style="position:absolute;left:-9999px">${pick()}</p>`,
    `<p style="position:absolute;clip:rect(0,0,0,0)">${pick()}</p>`,
    "</body></html>",
  ].join("");
}

/**
 * Same-origin iframe coverage (Phase 3). The hidden content lives in a child browsing context via
 * `srcdoc`, so a detector must descend into `iframe.contentDocument` to see it. Seeded via `ctx.rng`;
 * a button injects a further hidden node into the frame document after it has loaded.
 */
export function run({ rng, root }: ScenarioContext): void {
  const mount = root.querySelector<HTMLElement>(".iframe-mount");
  if (!mount) return;

  const iframe = document.createElement("iframe");
  iframe.title = "Scenario child frame";
  iframe.style.width = "100%";
  iframe.style.minHeight = "120px";
  iframe.style.border = "1px solid var(--color-border, #ccc)";
  iframe.srcdoc = buildSrcdoc(rng);
  mount.appendChild(iframe);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Inject hidden node into iframe";
  button.addEventListener("click", () => {
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    const node = doc.createElement("p");
    node.textContent = rng.pick(HIDDEN_SNIPPETS);
    node.style.opacity = "0.02";
    if (rng.bool()) window.setTimeout(() => doc.body.appendChild(node), rng.int(0, 400));
    else doc.body.appendChild(node);
  });
  mount.insertAdjacentElement("afterend", button);
}
