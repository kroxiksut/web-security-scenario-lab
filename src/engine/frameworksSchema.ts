/**
 * JSON Schema (draft-07) for the framework coverage matrix (`data/frameworks.json`). Ajv validates
 * the matrix at build/test time (tests/unit/frameworks.test.ts) so a malformed coverage dimension
 * cannot ship — the matrix drives the coverage view and may affect evaluation ground truth, so it
 * is held to the same structural rigor as scenario manifests. Not bundled into the runtime.
 */
export const frameworksSchema = {
  $id: "https://pagecheck.local/schemas/frameworks.json",
  type: "object",
  additionalProperties: false,
  required: ["frameworks"],
  properties: {
    frameworks: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/definitions/framework" },
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
    framework: {
      type: "object",
      additionalProperties: false,
      required: ["id", "name", "kind", "versions"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9-]+$" },
        name: { type: "string", minLength: 1 },
        kind: { enum: ["library", "framework"] },
        versions: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/definitions/version" },
        },
      },
    },
    version: {
      type: "object",
      additionalProperties: false,
      required: ["version", "major", "folder", "alias", "releaseDate", "whyIncluded", "scenarios"],
      properties: {
        // Exact pin — reject a leading caret/tilde range so stale/legacy stays intentional.
        version: { type: "string", pattern: "^[0-9][0-9A-Za-z.+-]*$" },
        major: { type: "string", pattern: "^[0-9]+$" },
        folder: { type: "string", pattern: "^v[0-9A-Za-z.-]+$" },
        alias: { type: "string", pattern: "^[a-z0-9@/._-]+$" },
        // ISO calendar date. Pattern-checked (not Ajv `format`) to avoid an ajv-formats dependency.
        releaseDate: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
        whyIncluded: { $ref: "#/definitions/localized" },
        scenarios: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/definitions/scenarioRef" },
          uniqueItems: true,
        },
      },
    },
    scenarioRef: {
      type: "object",
      additionalProperties: false,
      required: ["id", "page"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9-]+$" },
        // Repo-root-relative page path; no leading slash, must end in .html.
        page: { type: "string", pattern: "^[A-Za-z0-9._/-]+\\.html$" },
      },
    },
  },
};
