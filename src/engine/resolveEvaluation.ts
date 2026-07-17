import type { EvaluationMeta, Localized, ScenarioManifest, Severity } from "./types.ts";

export const DEFAULT_LOCALE = "en";

/** Pick a localized string for `locale`, falling back to `en`. */
export function localize(value: Localized, locale: string, fallback = DEFAULT_LOCALE): string {
  return value[locale] ?? value[fallback] ?? value.en;
}

/**
 * Evaluation metadata with all localized fields resolved to a single locale. `whyFlagged` and
 * `whyBenign` are each present only when the manifest supplies them (keyed on `shouldFire`).
 */
export interface ResolvedEvaluation {
  expectedSignal: string;
  shouldFire: boolean;
  severity: Severity;
  tags: string[];
  coverageDimensions: string[];
  whyFlagged?: string;
  whyBenign?: string;
  notes?: string;
}

/** Resolve a manifest's evaluation ground truth into a locale-specific view for the UI panel. */
export function resolveEvaluation(manifest: ScenarioManifest, locale: string): ResolvedEvaluation {
  const e: EvaluationMeta = manifest.evaluation;
  const resolved: ResolvedEvaluation = {
    expectedSignal: e.expectedSignal,
    shouldFire: e.shouldFire,
    severity: e.severity,
    tags: [...e.tags],
    coverageDimensions: [...e.coverageDimensions],
  };
  if (e.whyFlagged) resolved.whyFlagged = localize(e.whyFlagged, locale);
  if (e.whyBenign) resolved.whyBenign = localize(e.whyBenign, locale);
  if (e.notes) resolved.notes = localize(e.notes, locale);
  return resolved;
}
