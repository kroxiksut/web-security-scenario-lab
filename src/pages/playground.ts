/**
 * Module playground controller. Replaces the old flat catalog of static per-framework cards with a
 * single generative page per module: pick which techniques/methods are active (default: all),
 * reroll the seed for fresh text/geometry, choose how deeply the problems are embedded, and read the
 * answer key of what PageCheck should report. The technique catalog is the ground truth; the seeded
 * generator (engine) produces the problems; a vanilla adapter renders them; this file is the glue.
 *
 * Runtime selector currently offers vanilla only — framework adapters are the next slice, and they
 * plug in here without changing the information architecture.
 */

import type { TechniqueCatalog } from "../engine/techniqueCatalog.ts";
import { generateProblems, type Problem } from "../engine/generateProblems.ts";
import { buildDecoyEnvironment, type EnvironmentMode } from "../playground/decoyEnvironment.ts";
import { renderProblems } from "../playground/renderers.ts";
import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";
import { mountScenarioControls, resolveSeed } from "../shell/scenarioControls.ts";

// One catalog per module; resolve the one named by `data-module` at runtime (dynamic glob keeps
// each module's catalog its own chunk). Catalogs are schema-validated at build/test time
// (tests/unit/techniques.test.ts), so the runtime trusts them and does not bundle Ajv.
const catalogModules = import.meta.glob<{ default: TechniqueCatalog }>("/data/techniques/*.json");

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);
}

function localized(value: Record<string, string>, locale: string): string {
  return value[locale] ?? value.en ?? "";
}

async function loadCatalog(moduleId: string): Promise<TechniqueCatalog | null> {
  const loader = catalogModules[`/data/techniques/${moduleId}.json`];
  if (!loader) return null;
  return (await loader()).default;
}

/** Every method id in the catalog, in catalog order. */
function allMethodIds(catalog: TechniqueCatalog): string[] {
  return catalog.techniques.flatMap((tech) => tech.methods.map((m) => m.id));
}

interface PlaygroundState {
  seed: string;
  enabled: Set<string>;
  env: EnvironmentMode;
}

/** Read the enabled-method set and environment mode from the URL (defaults: all methods, woven). */
function readState(catalog: TechniqueCatalog): PlaygroundState {
  const params = new URLSearchParams(window.location.search);
  const all = allMethodIds(catalog);
  const on = params.get("on");
  const enabled = new Set(on === null ? all : on.split(",").filter((id) => all.includes(id)));
  const env: EnvironmentMode = params.get("env") === "isolated" ? "isolated" : "woven";
  return { seed: resolveSeed(), enabled, env };
}

/** Persist enabled-method / environment choices to the URL (no reload — seed changes reload). */
function writeState(catalog: TechniqueCatalog, state: PlaygroundState): void {
  const params = new URLSearchParams(window.location.search);
  const all = allMethodIds(catalog);
  if (state.enabled.size === all.length) params.delete("on");
  else params.set("on", all.filter((id) => state.enabled.has(id)).join(","));
  if (state.env === "isolated") params.set("env", "isolated");
  else params.delete("env");
  const query = params.toString();
  history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}

/** The control card: runtime selector, embedding toggle, per-technique method checkboxes. */
function renderControls(host: HTMLElement, catalog: TechniqueCatalog, state: PlaygroundState): void {
  const locale = getLocale();
  const groups = catalog.techniques
    .map((tech) => {
      const boxes = tech.methods
        .map((m) => {
          const checked = state.enabled.has(m.id) ? " checked" : "";
          const benign = m.benign ? ` <span class="badge badge--benign">${esc(t(locale, "playground.benign_badge"))}</span>` : "";
          return `<label class="pg-check"><input type="checkbox" data-method="${esc(m.id)}"${checked} /> ${esc(localized(m.title, locale))}${benign}</label>`;
        })
        .join("");
      return `<fieldset class="pg-group"><legend>${esc(localized(tech.title, locale))}</legend>${boxes}</fieldset>`;
    })
    .join("");

  host.innerHTML = `
    <div class="pg-controls">
      <div class="pg-controls__row">
        <div class="pg-field">
          <span class="pg-field__label">${esc(t(locale, "playground.runtime"))}</span>
          <select class="pg-runtime" disabled>
            <option>${esc(t(locale, "playground.runtime.vanilla"))}</option>
          </select>
          <span class="muted pg-soon">${esc(t(locale, "playground.runtime.frameworks_soon"))}</span>
        </div>
        <div class="pg-field">
          <span class="pg-field__label">${esc(t(locale, "playground.environment"))}</span>
          <label class="pg-check"><input type="radio" name="pg-env" data-env="woven"${state.env === "woven" ? " checked" : ""} /> ${esc(t(locale, "playground.environment.woven"))}</label>
          <label class="pg-check"><input type="radio" name="pg-env" data-env="isolated"${state.env === "isolated" ? " checked" : ""} /> ${esc(t(locale, "playground.environment.isolated"))}</label>
        </div>
      </div>
      <div class="pg-techniques">
        <div class="pg-techniques__head">
          <strong>${esc(t(locale, "playground.techniques"))}</strong>
          <span class="pg-bulk">
            <button type="button" class="button button--ghost" data-bulk="all">${esc(t(locale, "playground.select_all"))}</button>
            <button type="button" class="button button--ghost" data-bulk="none">${esc(t(locale, "playground.select_none"))}</button>
          </span>
        </div>
        ${groups}
      </div>
    </div>`;
}

/** The answer-key sidepanel: what the detector should report for the currently generated page. */
function renderAnswerKey(problems: Problem[], catalog: TechniqueCatalog): void {
  const panel = document.querySelector<HTMLElement>(".app-sidepanel");
  if (!panel) return;
  const locale = getLocale();
  const titleFor = new Map(
    catalog.techniques.flatMap((tech) => tech.methods.map((m) => [m.id, localized(m.title, locale)])),
  );
  const positives = problems.filter((p) => !p.benign).length;
  const benign = problems.length - positives;

  const rows = problems
    .map((p) => {
      const label = titleFor.get(p.methodId) ?? p.methodId;
      if (p.benign) {
        return `<li class="pg-ans pg-ans--benign">
          <span class="pg-ans__name">${esc(label)}</span>
          <span class="badge badge--benign">${esc(t(locale, "playground.expected_benign"))}</span>
        </li>`;
      }
      return `<li class="pg-ans">
        <span class="pg-ans__name">${esc(label)}</span>
        <span class="badge badge--positive">${esc(t(locale, "playground.expected_fire"))}</span>
        <code class="pg-ans__type">${esc(p.expected.findingType ?? "")}</code>
        <span class="badge badge--severity-${esc(p.expected.severity ?? "low")}">${esc(p.expected.severity ?? "")}</span>
      </li>`;
    })
    .join("");

  const summary = t(locale, "playground.summary")
    .replace("{total}", String(problems.length))
    .replace("{positive}", String(positives))
    .replace("{benign}", String(benign));

  panel.innerHTML = `
    <div class="panel__header"><strong>${esc(t(locale, "playground.answer_key"))}</strong></div>
    <div class="panel__body">
      <p class="muted">${esc(t(locale, "playground.answer_key.desc"))}</p>
      <p class="pg-ans__summary">${esc(summary)}</p>
      <ul class="pg-ans__list">${rows || `<li class="muted">${esc(t(locale, "catalog.empty"))}</li>`}</ul>
    </div>`;
}

/** Regenerate the problems for the current state and (re)render the decoy page + answer key. */
function regenerate(decoyHost: HTMLElement, catalog: TechniqueCatalog, state: PlaygroundState): void {
  const { root, slots } = buildDecoyEnvironment(state.env);
  const problems = generateProblems(catalog, {
    seed: state.seed,
    enabledMethods: allMethodIds(catalog).filter((id) => state.enabled.has(id)),
    slots: slots.length,
  });
  renderProblems(problems, slots);
  decoyHost.replaceChildren(root);
  renderAnswerKey(problems, catalog);
}

/** Wire up the module playground: build controls, generate the page, keep both in sync with input. */
export function initPlaygroundPage(): void {
  const host = document.querySelector<HTMLElement>("[data-playground]");
  const moduleId = document.body.dataset.module;
  if (!host || !moduleId) return;

  const seed = resolveSeed();
  mountScenarioControls(seed);

  void loadCatalog(moduleId)
    .then((catalog) => {
      if (!catalog) {
        host.innerHTML = `<p class="muted">${esc(t(getLocale(), "catalog.empty"))}</p>`;
        return;
      }
      const state = readState(catalog);

      const controlsHost = document.createElement("div");
      const decoyHost = document.createElement("div");
      decoyHost.dataset.decoyHost = "1";
      host.replaceChildren(controlsHost, decoyHost);

      const rerender = (): void => {
        renderControls(controlsHost, catalog, state);
        regenerate(decoyHost, catalog, state);
      };

      // Delegate all control input from the controls host.
      controlsHost.addEventListener("change", (event) => {
        const target = event.target as HTMLElement;
        const method = target.dataset?.method;
        const env = target.dataset?.env;
        if (method) {
          if ((target as HTMLInputElement).checked) state.enabled.add(method);
          else state.enabled.delete(method);
          writeState(catalog, state);
          regenerate(decoyHost, catalog, state);
        } else if (env) {
          state.env = env === "isolated" ? "isolated" : "woven";
          writeState(catalog, state);
          regenerate(decoyHost, catalog, state);
        }
      });
      controlsHost.addEventListener("click", (event) => {
        const bulk = (event.target as HTMLElement).dataset?.bulk;
        if (!bulk) return;
        if (bulk === "all") allMethodIds(catalog).forEach((id) => state.enabled.add(id));
        else state.enabled.clear();
        writeState(catalog, state);
        rerender();
      });

      rerender();
      document.addEventListener("lab:localechange", rerender);
    })
    .catch((err: unknown) => {
      console.error("[playground] failed to load catalog", err);
    });
}
