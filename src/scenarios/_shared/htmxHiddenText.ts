import type { ScenarioContext } from "../context.ts";

/**
 * Shared htmx hidden-text behavior (Phase 3 robustness). htmx is a hypermedia library: it issues an
 * AJAX request from `hx-*` attributes and **swaps the returned server HTML into the page**. Here the
 * hidden nodes are NOT built in-page by JS — they arrive as a static server fragment
 * (`public/lab-fragments/htmx-hidden.html`) that htmx swaps in on load and on each click. So the
 * detector must fire on AJAX-swapped, out-of-band-inserted content, not only on DOM authored in the
 * page's own script. This is a fixed-mode scenario (the fragment is static server content, so the
 * seeded rng does not apply). htmx is injected as a param for consistency with the other drivers.
 * NOT unit-tested (scenario behavior).
 *
 * The htmx instance is typed to just the minimal `process(Element)` surface we use, so both the htmx 2
 * root dep (`process(string | Element)`) and the htmx 1 legacy alias (`process(Element)`) satisfy it
 * without version-specific type wrangling — we always pass an Element.
 */
export function runHtmxHiddenText(
  htmx: { process(elt: Element): void },
  { root }: ScenarioContext,
): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  // Resolve the fragment relative to the page via data-root so it works identically under the Vite
  // dev server (public/ served at site root) and in the built dist/ (public/ copied to dist root).
  const rootPath = document.body.dataset.root ?? ".";
  const fragmentUrl = `${rootPath}/lab-fragments/htmx-hidden.html`;

  const sink = document.createElement("div");
  sink.id = "htmx-sink";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "button button--ghost";
  trigger.textContent = "Load hidden fragment (htmx)";
  trigger.setAttribute("hx-get", fragmentUrl);
  trigger.setAttribute("hx-target", "#htmx-sink");
  trigger.setAttribute("hx-swap", "beforeend");
  // Fire once on load (so the page shows swapped hidden content without interaction) and again on
  // each click (interactive growth), matching the other framework scenarios' "grows on click" shape.
  trigger.setAttribute("hx-trigger", "load, click");

  playground.appendChild(trigger);
  playground.appendChild(sink);

  // Wire htmx onto the dynamically-created elements (htmx only auto-processes markup present at its
  // own init; our trigger is added afterwards, so process() is required to bind hx-* and the load trigger).
  htmx.process(playground);
}
