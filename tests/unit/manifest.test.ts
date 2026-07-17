import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { assertManifest, validateManifest } from "../../src/engine/validateManifest.ts";
import { localize, resolveEvaluation } from "../../src/engine/resolveEvaluation.ts";
import type { ScenarioManifest } from "../../src/engine/types.ts";

const scenarioDir = new URL("../../data/scenarios/", import.meta.url);
const realManifest = JSON.parse(
  readFileSync(new URL("hidden-text-mixed.json", scenarioDir), "utf8"),
) as unknown;

describe("manifest validation", () => {
  it("accepts the real hidden-text-mixed manifest", () => {
    const { valid, errors } = validateManifest(realManifest);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it("every manifest shipped in data/scenarios validates", () => {
    // The runtime trusts manifests (Ajv is not bundled), so this build-time gate is what
    // guarantees a new manifest cannot ship with a malformed ground truth.
    const files = readdirSync(scenarioDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const data = JSON.parse(readFileSync(new URL(file, scenarioDir), "utf8")) as unknown;
      const { valid, errors } = validateManifest(data);
      expect(errors, `${file} failed schema validation`).toEqual([]);
      expect(valid).toBe(true);
    }
  });

  it("rejects a manifest missing required evaluation fields", () => {
    const bad = {
      id: "broken",
      module: "visual-manipulation",
      title: { en: "Broken" },
      evaluation: { expectedSignal: "x", shouldFire: true },
    };
    expect(validateManifest(bad).valid).toBe(false);
  });

  it("rejects an unknown module and a bad id pattern", () => {
    expect(validateManifest({ ...(realManifest as object), module: "made-up" }).valid).toBe(false);
    expect(validateManifest({ ...(realManifest as object), id: "Has Spaces" }).valid).toBe(false);
  });

  it("rejects unknown severity values", () => {
    const m = structuredClone(realManifest) as { evaluation: { severity: string } };
    m.evaluation.severity = "apocalyptic";
    expect(validateManifest(m).valid).toBe(false);
  });

  it("requires whyBenign for a benign (shouldFire:false) scenario", () => {
    // A benign false-positive control must document why the detector must NOT fire; the schema's
    // conditional requirement is what stops a benign manifest from shipping without that rationale.
    const benignNoRationale = {
      id: "benign-no-rationale",
      module: "trigger-phrases",
      title: { en: "Benign" },
      evaluation: {
        expectedSignal: "none",
        shouldFire: false,
        severity: "low",
        tags: [],
        coverageDimensions: [],
        // whyBenign intentionally omitted
      },
    };
    expect(validateManifest(benignNoRationale).valid).toBe(false);

    const benignWithRationale = structuredClone(benignNoRationale) as typeof benignNoRationale & {
      evaluation: { whyBenign?: { en: string } };
    };
    benignWithRationale.evaluation.whyBenign = { en: "Quoted phrase in a code sample." };
    expect(validateManifest(benignWithRationale).valid).toBe(true);
  });

  it("assertManifest throws readable errors on invalid input", () => {
    expect(() => assertManifest({ id: "x" }, "test")).toThrow(/Invalid scenario test/);
  });
});

describe("evaluation resolution", () => {
  const manifest = assertManifest(realManifest, "hidden-text-mixed");

  it("resolves localized fields for ru", () => {
    const ru = resolveEvaluation(manifest, "ru");
    expect(ru.severity).toBe("high");
    expect(ru.shouldFire).toBe(true);
    expect(ru.whyFlagged).toContain("Страница прячет");
    expect(ru.coverageDimensions).toContain("hidden text");
  });

  it("falls back to en for an unknown locale", () => {
    const xx = resolveEvaluation(manifest, "xx");
    expect(xx.whyFlagged).toBe((manifest as ScenarioManifest).evaluation.whyFlagged?.en);
  });

  it("localize() prefers the requested locale then falls back", () => {
    expect(localize({ en: "E", ru: "Р" }, "ru")).toBe("Р");
    expect(localize({ en: "E" }, "ru")).toBe("E");
  });
});
