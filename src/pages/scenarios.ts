import type { ModuleId, ScenarioManifest } from "../engine/types.ts";
import { localize } from "../engine/resolveEvaluation.ts";
import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";

// Lazily load every scenario manifest for the full index. The glob is dynamic (not eager) so each
// manifest stays its own chunk — matching scenario.ts, which also dynamically imports them; an eager
// import here would collide with that dynamic import and defeat per-scenario code-splitting.
// Manifests are schema-validated at build/test time (tests/unit/manifest.test.ts), so the runtime
// trusts them and does NOT bundle Ajv — matching how scenario.ts and frameworks.ts load their data.
const manifestModules = import.meta.glob<{ default: ScenarioManifest }>("/data/scenarios/*.json");
let manifests: ScenarioManifest[] = [];

async function loadManifests(): Promise<ScenarioManifest[]> {
  const loaded = await Promise.all(Object.values(manifestModules).map((load) => load()));
  return loaded.map((m) => m.default);
}

// Detection modules, in a stable presentation order. Each maps to an existing nav i18n label.
const MODULE_ORDER: { id: ModuleId; i18nKey: string }[] = [
  { id: "visual-manipulation", i18nKey: "module.visual" },
  { id: "link-domain-security", i18nKey: "module.link" },
  { id: "trigger-phrases", i18nKey: "module.trigger" },
  { id: "prompt-splitting", i18nKey: "module.prompt" },
  { id: "api-interception", i18nKey: "module.api" },
];

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);
}

/** Positives first, then benign controls, then alphabetically by id — a stable, readable order. */
function byFireThenId(a: ScenarioManifest, b: ScenarioManifest): number {
  const fa = a.evaluation.shouldFire ? 0 : 1;
  const fb = b.evaluation.shouldFire ? 0 : 1;
  return fa !== fb ? fa - fb : a.id.localeCompare(b.id);
}

function summaryLine(locale: string): string {
  const modulesWith = MODULE_ORDER.filter((m) => manifests.some((s) => s.module === m.id)).length;
  return `${manifests.length} / ${modulesWith} — ${esc(t(locale, "scenarios.summary"))}`;
}

function scenarioRow(s: ScenarioManifest, locale: string, rootPath: string): string {
  const e = s.evaluation;
  const href = `${rootPath}/${s.page}`;
  const fireClass = e.shouldFire ? "badge--positive" : "badge--benign";
  const fireLabel = t(locale, e.shouldFire ? "scenarios.positive" : "scenarios.benign");
  const tags = e.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join("");
  return `
    <tr>
      <td>
        <a href="${esc(href)}" data-test-link="true"><strong>${esc(localize(s.title, locale))}</strong></a>
        <div><code>${esc(s.id)}</code></div>
      </td>
      <td><code>${esc(e.expectedSignal)}</code></td>
      <td><span class="badge ${fireClass}">${esc(fireLabel)}</span></td>
      <td><span class="badge badge--severity-${esc(e.severity)}">${esc(e.severity)}</span></td>
      <td class="sc-tags">${tags}</td>
    </tr>`;
}

function moduleSection(
  module: { id: ModuleId; i18nKey: string },
  locale: string,
  rootPath: string,
): string {
  const rows = manifests
    .filter((s) => s.module === module.id)
    .sort(byFireThenId)
    .map((s) => scenarioRow(s, locale, rootPath))
    .join("");
  if (!rows) return "";
  return `
    <section class="sc-group">
      <h2 class="sc-group__title">${esc(t(locale, module.i18nKey))}</h2>
      <div class="sc-table-wrap">
        <table class="sc-table">
          <thead>
            <tr>
              <th>${esc(t(locale, "scenarios.col.scenario"))}</th>
              <th>${esc(t(locale, "scenarios.col.expected"))}</th>
              <th>${esc(t(locale, "scenarios.col.fires"))}</th>
              <th>${esc(t(locale, "scenarios.col.severity"))}</th>
              <th>${esc(t(locale, "scenarios.col.tags"))}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function render(locale: string): void {
  const host = document.querySelector<HTMLElement>("[data-scenarios-catalog]");
  if (!host) return;
  const rootPath = document.body.dataset.root ?? ".";
  const frameworksHref = `${rootPath}/pages/frameworks/index.html`;
  host.innerHTML = `
    <p class="muted sc-summary">${summaryLine(locale)}</p>
    <p class="muted sc-note">
      ${esc(t(locale, "scenarios.frameworks_note"))}
      <a href="${esc(frameworksHref)}">${esc(t(locale, "nav.frameworks"))}</a>.
    </p>
    ${MODULE_ORDER.map((m) => moduleSection(m, locale, rootPath)).join("")}`;
}

/** Render the full scenario catalog grouped by detection module; re-render on locale change. */
export function initScenariosPage(): void {
  void loadManifests()
    .then((loaded) => {
      manifests = loaded;
      render(getLocale());
      document.addEventListener("lab:localechange", () => render(getLocale()));
    })
    .catch((err: unknown) => {
      console.error("[scenarios] failed to load manifests", err);
    });
}
