import { translateDom } from "../i18n/index.ts";
import { getLocale } from "./language.ts";

/** Active scenario seed from `?seed=`, defaulting to a stable value for a reproducible first load. */
export function resolveSeed(): string {
  return new URLSearchParams(window.location.search).get("seed") ?? "default";
}

function navigateWithSeed(seed: string | null): void {
  const params = new URLSearchParams(window.location.search);
  if (seed === null) params.delete("seed");
  else params.set("seed", seed);
  window.location.search = params.toString();
}

/**
 * Render the seed / reroll / reset / copy-link controls at the top of a scenario page.
 * Changing the seed reloads the page, so the scenario re-runs deterministically for that seed.
 */
export function mountScenarioControls(seed: string): void {
  const main = document.querySelector<HTMLElement>(".app-main");
  if (!main) return;

  const bar = document.createElement("div");
  bar.className = "scenario-controls";
  bar.innerHTML = `
    <label class="scenario-controls__seed">
      <span data-i18n="scenario.seed">Seed</span>
      <input type="text" class="scenario-seed-input" />
    </label>
    <button type="button" class="button" data-scenario-reroll data-i18n="scenario.reroll">Reroll</button>
    <button type="button" class="button button--ghost" data-scenario-reset data-i18n="scenario.reset">Reset</button>
    <button type="button" class="button button--ghost" data-scenario-copy data-i18n="scenario.copy_link">Copy Deep Link</button>`;
  main.prepend(bar);
  translateDom(getLocale(), bar);

  // Set the seed via property (never interpolate URL input into innerHTML).
  const input = bar.querySelector<HTMLInputElement>(".scenario-seed-input");
  if (input) {
    input.value = seed;
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") navigateWithSeed(input.value.trim() || null);
    });
  }

  bar.querySelector("[data-scenario-reroll]")?.addEventListener("click", () => {
    // Date.now() is entropy for choosing a *new seed*, not scenario content (which stays
    // seed-reproducible once the seed is fixed).
    navigateWithSeed(String(Date.now()));
  });
  bar.querySelector("[data-scenario-reset]")?.addEventListener("click", () => {
    navigateWithSeed(null);
  });
  bar.querySelector("[data-scenario-copy]")?.addEventListener("click", () => {
    void navigator.clipboard?.writeText(window.location.href);
  });
}
