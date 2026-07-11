import { createRng } from "../engine/random.ts";
import { resolveEvaluation } from "../engine/resolveEvaluation.ts";
import type { ScenarioManifest } from "../engine/types.ts";
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
  panel.innerHTML = `
    <div class="panel__header"><strong>${esc(t(locale, "evaluation.title"))}</strong></div>
    <div class="panel__body">
      <span class="badge badge--severity-${esc(e.severity)}">${esc(e.severity)}</span>
      <dl class="eval-list">
        <dt>${esc(t(locale, "evaluation.expected_signal"))}</dt>
        <dd>${esc(e.expectedSignal)}</dd>
        <dt>${esc(fireLabel)}</dt>
        <dd>${e.shouldFire ? "✓" : "—"}</dd>
        <dt>${esc(t(locale, "evaluation.why_flagged"))}</dt>
        <dd>${esc(e.whyFlagged)}</dd>
      </dl>
      <div class="tag-list">${tags}</div>
    </div>`;
}

/**
 * Drive a scenario page: mount seed controls, run the seeded/interactive behavior, and render
 * the live evaluation panel from the manifest ground truth (re-rendered on locale change).
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
      renderPanel(manifest, getLocale());
      document.addEventListener("lab:localechange", () => renderPanel(manifest, getLocale()));
    })
    .catch((err: unknown) => {
      console.error("[scenario] failed to load manifest", err);
    });
}
