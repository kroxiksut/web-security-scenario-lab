/**
 * JSON Schema (draft-07) for a module technique catalog (`data/techniques/<module>.json`). Ajv
 * validates it at build/test time (`tests/unit/techniques.test.ts`) so a malformed catalog cannot
 * ship — the catalog is the ground truth the playground's answer key is generated from. Structural
 * rules live here; semantic cross-checks (expected finding present iff positive; finding.type is a
 * known PageCheck type; unique ids) live in the test, mirroring the framework-matrix split.
 * Not bundled into the runtime.
 */
export const techniquesSchema = {
  $id: "https://pagecheck.local/schemas/techniques.json",
  type: "object",
  additionalProperties: false,
  required: ["module", "techniques"],
  properties: {
    module: {
      enum: [
        "visual-manipulation",
        "link-domain-security",
        "trigger-phrases",
        "prompt-splitting",
        "api-interception",
      ],
    },
    techniques: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/definitions/technique" },
    },
  },
  definitions: {
    localized: {
      type: "object",
      required: ["en"],
      properties: {
        en: { type: "string", minLength: 1 },
        ru: { type: "string" },
      },
      additionalProperties: { type: "string" },
    },
    technique: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title", "detector", "methods"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9-]+$" },
        title: { $ref: "#/definitions/localized" },
        detector: { type: "string", minLength: 1 },
        methods: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/definitions/method" },
        },
      },
    },
    method: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title", "benign", "shouldFire"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9-]+$" },
        title: { $ref: "#/definitions/localized" },
        benign: { type: "boolean" },
        shouldFire: { type: "boolean" },
        expected: { $ref: "#/definitions/expected" },
      },
      // A positive method must declare what should fire; a benign control must not.
      if: { properties: { shouldFire: { const: true } } },
      then: { required: ["expected"] },
      else: { not: { required: ["expected"] } },
    },
    expected: {
      type: "object",
      additionalProperties: false,
      required: ["type", "detector", "severity"],
      properties: {
        type: { type: "string", minLength: 1 },
        detector: { type: "string", minLength: 1 },
        severity: { enum: ["low", "medium", "high", "critical"] },
      },
    },
  },
};
