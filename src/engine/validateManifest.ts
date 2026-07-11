import Ajv, { type ErrorObject } from "ajv";
import { scenarioSchema } from "./manifestSchema.ts";
import type { ScenarioManifest } from "./types.ts";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(scenarioSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

/** Structurally validate an unknown value against the scenario manifest schema. */
export function validateManifest(data: unknown): ValidationResult {
  const valid = validate(data) as boolean;
  return { valid, errors: valid ? [] : (validate.errors ?? []) };
}

/** Validate and narrow, throwing a readable error on failure. Use when a manifest MUST be valid. */
export function assertManifest(data: unknown, source = "manifest"): ScenarioManifest {
  const { valid, errors } = validateManifest(data);
  if (!valid) {
    const detail = errors.map((e) => `  ${e.instancePath || "/"} ${e.message}`).join("\n");
    throw new Error(`Invalid scenario ${source}:\n${detail}`);
  }
  return data as ScenarioManifest;
}
