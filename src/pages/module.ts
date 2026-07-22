import type { ScenarioManifest } from "../engine/types.ts";
import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";

/**
 * Module catalog controller. The scenario cards used to be hand-written English markup in each
 * module's `index.html`, which meant the Russian UI showed English cards and the lists drifted from
 * the manifests (the visual-manipulation catalog listed 3 of its 18 framework variants). Now the grid
 * is rendered from the manifests themselves: `title` is already bilingual there, so the catalog
 * follows the UI language and can never disagree with the ground truth.
 *
 * Dynamic glob (not eager) so each manifest stays its own chunk, matching scenario.ts and
 * scenarios.ts — an eager glob makes Rolldown warn about the mixed import styles.
 */
const manifestModules = import.meta.glob<{ default: ScenarioManifest }>("/data/scenarios/*.json");

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);
}

function localized(value: Record<string, string> | undefined, locale: string): string {
  return value?.[locale] ?? value?.en ?? "";
}

/** Repo-root-relative manifest `page` → a URL relative to the page doing the linking. */
function href(page: string, root: string): string {
  return `${root}/${page}`;
}

function card(manifest: ScenarioManifest, locale: string, root: string): string {
  const e = manifest.evaluation;
  const verdictKey = e.shouldFire ? "scenarios.positive" : "scenarios.benign";
  const verdictClass = e.shouldFire ? "badge--positive" : "badge--benign";
  const tags = e.tags
    .slice(0, 4)
    .map((tag) => `<span class="tag">${esc(tag)}</span>`)
    .join("");
  return `
    <article class="card">
      <h3 style="margin-top: 0">${esc(localized(manifest.title, locale))}</h3>
      <p class="mc-badges">
        <span class="badge ${verdictClass}">${esc(t(locale, verdictKey))}</span>
        <span class="badge badge--severity-${esc(e.severity)}">${esc(e.severity)}</span>
      </p>
      <p class="muted mc-signal"><code>${esc(e.expectedSignal)}</code></p>
      <div class="tag-list mc-tags">${tags}</div>
      <a class="button" href="${esc(href(manifest.page, root))}" data-test-link="true">
        ${esc(t(locale, "module.open_test"))}
      </a>
    </article>`;
}

async function loadModuleScenarios(moduleId: string): Promise<ScenarioManifest[]> {
  const loaded = await Promise.all(
    Object.values(manifestModules).map((load) => load().then((mod) => mod.default)),
  );
  return (
    loaded
      .filter((manifest) => manifest.module === moduleId)
      // Positives first, benign controls last; stable alphabetical order within each group.
      .sort((a, b) => {
        if (a.evaluation.shouldFire !== b.evaluation.shouldFire)
          return a.evaluation.shouldFire ? -1 : 1;
        return a.id.localeCompare(b.id);
      })
  );
}

function render(host: HTMLElement, scenarios: ScenarioManifest[], root: string): void {
  const locale = getLocale();
  host.innerHTML = scenarios.length
    ? `<div class="card-grid">${scenarios.map((m) => card(m, locale, root)).join("")}</div>`
    : `<p class="muted">${esc(t(locale, "catalog.empty"))}</p>`;
}

/** Render the scenario cards for the module named by `data-module`, and keep them in sync with the locale. */
export function initModulePage(): void {
  const host = document.querySelector<HTMLElement>("[data-module-catalog]");
  const moduleId = document.body.dataset.module;
  if (!host || !moduleId) return;
  const root = document.body.dataset.root ?? ".";

  void loadModuleScenarios(moduleId)
    .then((scenarios) => {
      render(host, scenarios, root);
      document.addEventListener("lab:localechange", () => render(host, scenarios, root));
    })
    .catch((err: unknown) => {
      console.error("[module] failed to load manifests", err);
    });
}
