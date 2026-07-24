import Ajv, { type ErrorObject } from "ajv";
import { techniquesSchema } from "./techniquesSchema.ts";
import type { TechniqueCatalog } from "./techniqueCatalog.ts";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(techniquesSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

/** Structurally validate an unknown value against the technique-catalog schema. */
export function validateTechniques(data: unknown): ValidationResult {
  const valid = validate(data) as boolean;
  return { valid, errors: valid ? [] : (validate.errors ?? []) };
}

/** Validate and narrow, throwing a readable error on failure. */
export function assertTechniques(data: unknown, source = "techniques"): TechniqueCatalog {
  const { valid, errors } = validateTechniques(data);
  if (!valid) {
    const detail = errors.map((e) => `  ${e.instancePath || "/"} ${e.message}`).join("\n");
    throw new Error(`Invalid technique catalog ${source}:\n${detail}`);
  }
  return data as TechniqueCatalog;
}
