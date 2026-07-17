/**
 * JSON Schema (draft-07) for scenario manifests. Ajv validates every manifest against this so a
 * malformed ground truth is caught early — a wrong ground truth silently corrupts the detector's
 * regression signal, so this is the one place we lean on a library (Ajv) instead of hand-rolling.
 */
export const scenarioSchema = {
  $id: "https://pagecheck.local/schemas/scenario.json",
  type: "object",
  additionalProperties: false,
  required: ["id", "module", "title", "evaluation"],
  properties: {
    id: { type: "string", pattern: "^[a-z0-9-]+$" },
    module: {
      enum: [
        "visual-manipulation",
        "link-domain-security",
        "trigger-phrases",
        "prompt-splitting",
        "api-interception",
      ],
    },
    title: { $ref: "#/definitions/localized" },
    modes: {
      type: "array",
      items: { enum: ["fixed", "randomized"] },
      uniqueItems: true,
    },
    evaluation: {
      type: "object",
      additionalProperties: false,
      // `whyFlagged` / `whyBenign` are required conditionally (see `allOf` below): a positive
      // scenario must explain why the detector should fire; a benign control must explain why it
      // must NOT — so a false-positive control can never ship without a documented benign rationale.
      required: ["expectedSignal", "shouldFire", "severity", "tags", "coverageDimensions"],
      allOf: [
        {
          if: { properties: { shouldFire: { const: true } }, required: ["shouldFire"] },
          then: { required: ["whyFlagged"] },
        },
        {
          if: { properties: { shouldFire: { const: false } }, required: ["shouldFire"] },
          then: { required: ["whyBenign"] },
        },
      ],
      properties: {
        expectedSignal: { type: "string", minLength: 1 },
        shouldFire: { type: "boolean" },
        severity: { enum: ["low", "medium", "high", "critical"] },
        tags: { type: "array", items: { type: "string", minLength: 1 } },
        coverageDimensions: { type: "array", items: { type: "string", minLength: 1 } },
        whyFlagged: { $ref: "#/definitions/localized" },
        whyBenign: { $ref: "#/definitions/localized" },
        notes: { $ref: "#/definitions/localized" },
        detectionExamples: {
          type: "array",
          items: { $ref: "#/definitions/detectionExample" },
        },
      },
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
    detectionExample: {
      type: "object",
      additionalProperties: false,
      required: ["language", "snippet", "explanation"],
      properties: {
        language: { type: "string", minLength: 1 },
        snippet: { type: "string", minLength: 1 },
        explanation: { $ref: "#/definitions/localized" },
      },
    },
  },
};
