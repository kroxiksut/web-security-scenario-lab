import Ajv, { type ErrorObject } from "ajv";
import { frameworksSchema } from "./frameworksSchema.ts";
import type { FrameworkMatrix } from "./types.ts";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(frameworksSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

/** Structurally validate an unknown value against the framework-matrix schema. */
export function validateFrameworks(data: unknown): ValidationResult {
  const valid = validate(data) as boolean;
  return { valid, errors: valid ? [] : (validate.errors ?? []) };
}

/** Validate and narrow, throwing a readable error on failure. */
export function assertFrameworks(data: unknown, source = "frameworks"): FrameworkMatrix {
  const { valid, errors } = validateFrameworks(data);
  if (!valid) {
    const detail = errors.map((e) => `  ${e.instancePath || "/"} ${e.message}`).join("\n");
    throw new Error(`Invalid framework matrix ${source}:\n${detail}`);
  }
  return data as FrameworkMatrix;
}
