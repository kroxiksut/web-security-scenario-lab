import type { ScenarioContext } from "./context.ts";

/**
 * api-interception positive aligned to the detector's CURRENT signal: it inspects the `action`,
 * `src`, `data-api`, and `data-endpoint` attributes for the markers `api`, `/v1/`, and `/graphql`
 * (see PageCheck's ApiInterceptor README). This page plants elements whose attribute values carry
 * those markers, on RFC 2606 reserved domains, with a seeded interactive injector.
 *
 * No network: markers live in `data-*` attributes and a form `action` (neither fetches on render);
 * the one `<img>` uses an inline data-URI `src` and carries its marker on `data-api`, so nothing
 * ever resolves a reserved host. Covering the literal `src` attribute is deferred precisely to avoid
 * a runtime request to a non-resolving reserved domain (noted in the manifest).
 */

/** 1×1 transparent PNG — a valid, network-free <img src>. */
const BLANK_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

interface ApiSurface {
  host: "form" | "button" | "div" | "img";
  attr: "action" | "data-api" | "data-endpoint";
  /** Contains one of the markers: `api`, `/v1/`, or `/graphql`. */
  value: string;
  marker: string;
}

const API_SURFACES: readonly ApiSurface[] = [
  { host: "form", attr: "action", value: "https://api.orders.example/v1/create", marker: "/v1/" },
  { host: "button", attr: "data-api", value: "https://api.auth.example/v1/token", marker: "api" },
  { host: "div", attr: "data-endpoint", value: "https://backend.example/graphql", marker: "/graphql" },
  { host: "img", attr: "data-api", value: "https://cdn.example/api/telemetry", marker: "api" },
];

function plantSurface(container: HTMLElement, surface: ApiSurface): void {
  const item = document.createElement("div");
  item.className = "ai-item";

  const meta = document.createElement("p");
  meta.className = "muted ai-meta";
  meta.textContent = `lab-marker · ${surface.host}[${surface.attr}] · marker "${surface.marker}"`;
  item.appendChild(meta);

  let el: HTMLElement;
  switch (surface.host) {
    case "form": {
      const form = document.createElement("form");
      form.addEventListener("submit", (e) => e.preventDefault()); // never actually submit
      const label = document.createElement("span");
      label.textContent = "▶ API-shaped form action";
      form.appendChild(label);
      el = form;
      break;
    }
    case "img": {
      const img = document.createElement("img");
      img.src = BLANK_PNG;
      img.width = 16;
      img.height = 16;
      img.alt = "api surface pixel";
      el = img;
      break;
    }
    case "button": {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "▶ API-shaped control";
      el = btn;
      break;
    }
    default: {
      const div = document.createElement("div");
      div.textContent = "▶ API-shaped endpoint holder";
      el = div;
    }
  }
  el.classList.add("ai-surface");
  el.setAttribute(surface.attr, surface.value);
  item.appendChild(el);
  container.appendChild(item);
}

export function run({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".ai-playground");
  if (!playground) return;

  // Always plant the form (action + /v1/) as a fixed baseline, then a seeded spread of the rest.
  const baseline = API_SURFACES[0];
  if (baseline) plantSurface(playground, baseline);

  const pool = API_SURFACES.slice(1);
  const count = rng.int(2, pool.length);
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    const idx = rng.int(0, pool.length - 1);
    if (used.has(idx)) continue;
    used.add(idx);
    const surface = pool[idx];
    if (surface) plantSurface(playground, surface);
  }

  // Interactive injector: appends another API surface, sometimes after a short delay (mutation queue).
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Add API surface";
  button.addEventListener("click", () => {
    const surface = rng.pick(API_SURFACES);
    const doPlant = (): void => plantSurface(playground, surface);
    if (rng.bool()) window.setTimeout(doPlant, rng.int(50, 400));
    else doPlant();
  });
  playground.insertAdjacentElement("afterend", button);
}
