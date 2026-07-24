/**
 * Technique-catalog types (`data/techniques/<module>.json`).
 *
 * A module playground is a composition of many problems, so ground truth can no longer live as a
 * single verdict per manifest. The catalog is the source of truth for *which* techniques and hiding
 * methods a module exposes and *what the detector is expected to report* for each. The seeded
 * generator (`generateProblems.ts`) turns a chosen subset into concrete `Problem[]`, and the
 * playground's evaluation panel renders those as the answer key. Validated at build/test time with
 * Ajv (same pattern as the framework matrix); never bundled into the runtime as a validator.
 */

import type { Localized, ModuleId, Severity } from "./types.ts";

/**
 * Finding `type` values PageCheck's visual-manipulation detectors actually emit (read from
 * `../chrome/modules/visual-manipulation/detectors/*.js`, not the README, which understates them).
 * A catalog method's expected finding must name one of these, so the lab can never claim a signal
 * the detector has no vocabulary for. Enforced by `tests/unit/techniques.test.ts`.
 */
export const KNOWN_FINDING_TYPES = [
  // hiddenTextDetector
  "hidden-text",
  // styleObfuscationDetector
  "style-obfuscation",
  "semantic-visibility-mismatch",
  "filter-blend-manipulation",
  "transform-suppression",
  "clipping-hiding",
  "css-bidi-presentation",
  "pseudo-content-substitution",
  "css-text-masking",
  // overlayDetector
  "overlay",
  "full-screen-overlay",
  "click-capture-layer",
  "suspicious-stacking-pattern",
  "deceptive-capture-surface",
  // hiddenInputDetector
  "hidden-input",
  "hidden-editable-surface",
] as const;

export type FindingType = (typeof KNOWN_FINDING_TYPES)[number];

/** What the detector should report for a positive method (the answer-key row). */
export interface ExpectedFinding {
  /** PageCheck finding `type` — must be one of {@link KNOWN_FINDING_TYPES}. */
  type: FindingType;
  /** Detector expected to raise it, e.g. `hiddenTextDetector` (documentary; from the module source). */
  detector: string;
  /** Expected severity hint. Real severity varies with context; this is the nominal case. */
  severity: Severity;
}

/**
 * One hiding/manipulation method under a technique — a single checkbox in the playground and a
 * single row in the answer key. A positive method (`shouldFire: true`) carries an
 * `expected` finding; a benign control (`shouldFire: false`) omits it (its expected signal is
 * "none"), and exercises the detector's false-positive suppression.
 */
export interface TechniqueMethod {
  /** Stable id, kebab-case; the generator authors params and the renderer applies DOM by this id. */
  id: string;
  title: Localized;
  /** A legitimate/decoy use that must NOT fire (accessibility helper, decorative small text, …). */
  benign: boolean;
  shouldFire: boolean;
  expected?: ExpectedFinding;
}

/** A technique = a PageCheck detector family (hidden text, overlays, style obfuscation, …). */
export interface Technique {
  id: string;
  title: Localized;
  /** The PageCheck detector this technique maps to (documentary). */
  detector: string;
  methods: TechniqueMethod[];
}

/** The per-module technique catalog (`data/techniques/<module>.json`). */
export interface TechniqueCatalog {
  module: ModuleId;
  techniques: Technique[];
}
