import matrixData from "../../data/frameworks.json";
import { createRng } from "../engine/random.ts";
import { resolveEvaluation } from "../engine/resolveEvaluation.ts";
import type { FrameworkMatrix, ScenarioManifest } from "../engine/types.ts";
import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";
import { mountScenarioControls, resolveSeed } from "../shell/scenarioControls.ts";
import type { ScenarioContext } from "../scenarios/context.ts";

// Vite bundles every scenario manifest; we resolve the one named by `data-scenario` at runtime.
// Manifests are schema-validated at build/test time (tests/unit/manifest.test.ts), so the runtime
// trusts them and does NOT bundle Ajv — keeping the per-page bundle small (see AGENTS.md).
const manifestModules = import.meta.glob<{ default: ScenarioManifest }>("/data/scenarios/*.json");

// Optional per-scenario behavior module (seeded, interactive DOM). A scenario may ship without one.
const behaviorModules = import.meta.glob<{ run: (ctx: ScenarioContext) => void }>(
  "/src/scenarios/*.ts",
);

async function loadScenario(id: string): Promise<ScenarioManifest> {
  const loader = manifestModules[`/data/scenarios/${id}.json`];
  if (!loader) throw new Error(`Unknown scenario manifest: ${id}`);
  const mod = await loader();
  return mod.default;
}

async function runBehavior(id: string, ctx: ScenarioContext): Promise<void> {
  const loader = behaviorModules[`/src/scenarios/${id}.ts`];
  if (!loader) return;
  const mod = await loader();
  mod.run(ctx);
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);
}

/** Render the evaluation ground truth into the sidepanel for the active locale. */
function renderPanel(manifest: ScenarioManifest, locale: string): void {
  const panel = document.querySelector<HTMLElement>(".app-sidepanel");
  if (!panel) return;
  const e = resolveEvaluation(manifest, locale);
  const fireLabel = t(
    locale,
    e.shouldFire ? "evaluation.should_fire" : "evaluation.should_not_fire",
  );
  const tags = e.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join("");
  // Positive scenarios explain why the detector should fire; benign controls explain why it must
  // not. Show whichever rationale the manifest carries for this scenario's `shouldFire`.
  const reasonKey = e.shouldFire ? "evaluation.why_flagged" : "evaluation.why_benign";
  const reasonText = (e.shouldFire ? e.whyFlagged : e.whyBenign) ?? e.whyFlagged ?? e.whyBenign;
  const reasonRow = reasonText
    ? `<dt>${esc(t(locale, reasonKey))}</dt><dd>${esc(reasonText)}</dd>`
    : "";
  const notesRow = e.notes
    ? `<dt>${esc(t(locale, "evaluation.notes"))}</dt><dd>${esc(e.notes)}</dd>`
    : "";
  panel.innerHTML = `
    <div class="panel__header"><strong>${esc(t(locale, "evaluation.title"))}</strong></div>
    <div class="panel__body">
      <span class="badge badge--severity-${esc(e.severity)}">${esc(e.severity)}</span>
      <dl class="eval-list">
        <dt>${esc(t(locale, "evaluation.expected_signal"))}</dt>
        <dd>${esc(e.expectedSignal)}</dd>
        <dt>${esc(fireLabel)}</dt>
        <dd>${e.shouldFire ? "✓" : "—"}</dd>
        ${reasonRow}
        ${notesRow}
      </dl>
      <div class="tag-list">${tags}</div>
    </div>`;
}

const matrix = matrixData as FrameworkMatrix;

/** Why this framework version is in the lab — bilingual copy already maintained in the matrix. */
function frameworkNote(scenarioId: string, locale: string): string | null {
  for (const framework of matrix.frameworks) {
    for (const version of framework.versions) {
      if (!version.scenarios.some((ref) => ref.id === scenarioId)) continue;
      const why = version.whyIncluded[locale] ?? version.whyIncluded.en ?? "";
      return `${framework.name} ${version.version} — ${why}`;
    }
  }
  return null;
}

/**
 * Localize the page header. The title lives in the manifest in both languages, so the heading
 * follows the UI language instead of being frozen English markup; `[data-scenario-hint]` gets the
 * shared focus-mode hint, and framework pages get their note from the matrix (also bilingual).
 */
function renderHeader(manifest: ScenarioManifest, locale: string): void {
  const heading = document.querySelector<HTMLElement>("[data-scenario-title]");
  const title = manifest.title[locale] ?? manifest.title.en;
  if (heading && title) {
    heading.textContent = title;
    document.title = `${title} | Web Security Scenario Lab`;
  }
  const hint = document.querySelector<HTMLElement>("[data-scenario-hint]");
  if (hint) hint.textContent = t(locale, "scenario.focus_hint");

  const note = document.querySelector<HTMLElement>("[data-framework-note]");
  if (note) note.textContent = frameworkNote(manifest.id, locale) ?? "";
}

/**
 * Drive a scenario page: mount seed controls, run the seeded/interactive behavior, and render
 * the localized header plus the live evaluation panel from the manifest ground truth (both
 * re-rendered on locale change).
 */
export function initScenarioPage(): void {
  const id = document.body.dataset.scenario;
  if (!id) return;

  const seed = resolveSeed();
  mountScenarioControls(seed);

  const root = document.querySelector<HTMLElement>(".app-main") ?? document.body;
  void runBehavior(id, { seed, rng: createRng(seed), root }).catch((err: unknown) => {
    console.error("[scenario] behavior failed", err);
  });

  void loadScenario(id)
    .then((manifest) => {
      renderHeader(manifest, getLocale());
      renderPanel(manifest, getLocale());
      document.addEventListener("lab:localechange", () => {
        renderHeader(manifest, getLocale());
        renderPanel(manifest, getLocale());
      });
    })
    .catch((err: unknown) => {
      console.error("[scenario] failed to load manifest", err);
    });
}
