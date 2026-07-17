import type { ScenarioContext } from "./context.ts";

/**
 * Benign false-positive control for api-interception (`shouldFire: false`).
 *
 * The page exposes the very attributes the detector inspects (`action`, `data-api`, `data-endpoint`),
 * but their values carry NONE of the markers it keys on (`api`, `/v1/`, `/graphql`): a plain checkout
 * form, a static config path, and an ordinary data attribute. Presence of the attribute is not an
 * API-surface signal — only a marked value is — so firing here would be a false positive.
 */
export function run({ root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".ai-playground");
  if (!playground) return;

  const benign: Array<{ host: "form" | "div" | "button"; attr: string; value: string; label: string }> = [
    { host: "form", attr: "action", value: "https://www.shop.example/checkout", label: "ordinary checkout form" },
    { host: "div", attr: "data-endpoint", value: "/static/site-config.json", label: "static config path" },
    { host: "button", attr: "data-api", value: "v2", label: "plain data attribute (no marker)" },
  ];

  for (const b of benign) {
    const item = document.createElement("div");
    item.className = "ai-item";
    const meta = document.createElement("p");
    meta.className = "muted ai-meta";
    meta.textContent = `lab-marker · benign · ${b.host}[${b.attr}] · no API marker`;
    item.appendChild(meta);

    let el: HTMLElement;
    if (b.host === "form") {
      const form = document.createElement("form");
      form.addEventListener("submit", (e) => e.preventDefault());
      const label = document.createElement("span");
      label.textContent = b.label;
      form.appendChild(label);
      el = form;
    } else if (b.host === "button") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b.label;
      el = btn;
    } else {
      const div = document.createElement("div");
      div.textContent = b.label;
      el = div;
    }
    el.classList.add("ai-surface");
    el.setAttribute(b.attr, b.value);
    item.appendChild(el);
    playground.appendChild(item);
  }
}
