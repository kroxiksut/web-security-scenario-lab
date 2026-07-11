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

/** Ground-truth evaluation metadata: what the detector is expected to do with this page. */
export interface EvaluationMeta {
  expectedSignal: string;
  shouldFire: boolean;
  severity: Severity;
  tags: string[];
  coverageDimensions: string[];
  whyFlagged: Localized;
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
