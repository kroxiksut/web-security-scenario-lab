/** Core scenario/evaluation types. See EVALUATION-OUTPUTS.md for field semantics. */

/** A string localized per UI language. `en` is always required as the fallback. */
export type Localized = { en: string } & Record<string, string>;

export type ModuleId =
  | "visual-manipulation"
  | "link-domain-security"
  | "trigger-phrases"
  | "prompt-splitting"
  | "api-interception";

export type Severity = "low" | "medium" | "high" | "critical";

export type ScenarioMode = "fixed" | "randomized";

/**
 * Educational, NON-executed example of a detector test shown next to a scenario.
 * Rendering is deferred (see EVALUATION-OUTPUTS.md); the field is reserved now so manifests
 * can carry it. It is documentation, never part of the test harness.
 */
export interface DetectionExample {
  language: string;
  snippet: string;
  explanation: Localized;
}

/**
 * Ground-truth evaluation metadata: what the detector is expected to do with this page.
 *
 * `whyFlagged` / `whyBenign` are conditionally required by the manifest schema, keyed on
 * `shouldFire`: a positive scenario (`shouldFire: true`) must carry `whyFlagged`; a benign
 * false-positive control (`shouldFire: false`) must carry `whyBenign`. Both are optional in the
 * type because a given manifest only supplies the one that matches its `shouldFire`. For a benign
 * control, use `expectedSignal: "none"`.
 */
export interface EvaluationMeta {
  expectedSignal: string;
  shouldFire: boolean;
  severity: Severity;
  tags: string[];
  coverageDimensions: string[];
  whyFlagged?: Localized;
  whyBenign?: Localized;
  notes?: Localized;
  detectionExamples?: DetectionExample[];
}

/** A scenario manifest (one JSON file under `data/scenarios/`). */
export interface ScenarioManifest {
  id: string;
  module: ModuleId;
  title: Localized;
  modes?: ScenarioMode[];
  evaluation: EvaluationMeta;
}

/**
 * One exact-pinned framework version. Library **version is a coverage dimension** (see AGENTS.md):
 * different majors emit different DOM/runtime signatures the detector must survive. Pins are
 * deliberate and NOT auto-updated — legacy is the point.
 */
export interface FrameworkVersion {
  /** Exact pinned version, e.g. "3.7.1" (no `^`). */
  version: string;
  /** Major line label used for grouping, e.g. "3". */
  major: string;
  /** Versioned folder segment under `frameworks/<id>/`, e.g. "v3". One version per page. */
  folder: string;
  /** Import specifier the scenario uses — a plain package or an npm alias (`jquery1`, `react18`). */
  alias: string;
  /** ISO release date of the pinned release (documentary; feeds the coverage matrix). */
  releaseDate: string;
  /** Why this version earns a slot in the matrix. */
  whyIncluded: Localized;
  /** Scenarios reproduced on this framework/version: manifest `id` + the page that hosts it. */
  scenarios: FrameworkScenarioRef[];
}

/** A scenario rendered on a specific framework/version, plus the page path that hosts it. */
export interface FrameworkScenarioRef {
  /** Manifest id under `data/scenarios/` (evaluation ground truth). */
  id: string;
  /** Repo-root-relative path to the hosting HTML page (e.g. `frameworks/react/v18/hidden-text.html`). */
  page: string;
}

/** One framework/library tracked by the coverage matrix, across its pinned versions. */
export interface FrameworkEntry {
  id: string;
  name: string;
  kind: "library" | "framework";
  versions: FrameworkVersion[];
}

/** The framework coverage matrix (`data/frameworks.json`). Expandable on two axes: libs and versions. */
export interface FrameworkMatrix {
  frameworks: FrameworkEntry[];
}
