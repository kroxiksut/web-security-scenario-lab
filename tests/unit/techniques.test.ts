import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { assertTechniques, validateTechniques } from "../../src/engine/validateTechniques.ts";
import { KNOWN_FINDING_TYPES, type TechniqueCatalog } from "../../src/engine/techniqueCatalog.ts";
import { generateProblems } from "../../src/engine/generateProblems.ts";
import { RENDERER_METHOD_IDS } from "../../src/playground/renderers.ts";

const realCatalog = JSON.parse(
  readFileSync(new URL("../../data/techniques/visual-manipulation.json", import.meta.url), "utf8"),
) as unknown;

describe("technique catalog validation", () => {
  it("accepts the real visual-manipulation catalog", () => {
    const { valid, errors } = validateTechniques(realCatalog);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it("rejects a positive method with no expected finding", () => {
    const bad = structuredClone(realCatalog) as TechniqueCatalog;
    const positive = bad.techniques[0]!.methods.find((m) => m.shouldFire)!;
    delete positive.expected;
    expect(validateTechniques(bad).valid).toBe(false);
  });

  it("rejects a benign control that declares an expected finding", () => {
    const bad = structuredClone(realCatalog) as TechniqueCatalog;
    const benign = bad.techniques[0]!.methods.find((m) => !m.shouldFire)!;
    benign.expected = { type: "hidden-text", detector: "hiddenTextDetector", severity: "low" };
    expect(validateTechniques(bad).valid).toBe(false);
  });

  it("rejects an unknown severity", () => {
    const bad = structuredClone(realCatalog) as TechniqueCatalog;
    const positive = bad.techniques[0]!.methods.find((m) => m.shouldFire)!;
    // @ts-expect-error deliberately invalid severity
    positive.expected!.severity = "fatal";
    expect(validateTechniques(bad).valid).toBe(false);
  });

  it("assertTechniques throws readable errors on invalid input", () => {
    expect(() => assertTechniques({ module: "visual-manipulation", techniques: [] }, "t")).toThrow(
      /Invalid technique catalog t/,
    );
  });
});

describe("technique catalog referential integrity", () => {
  const catalog = assertTechniques(realCatalog, "data/techniques/visual-manipulation.json");
  const known = new Set<string>(KNOWN_FINDING_TYPES);
  const allMethods = catalog.techniques.flatMap((t) => t.methods);

  it("names only finding types PageCheck actually emits", () => {
    for (const method of allMethods) {
      if (!method.expected) continue;
      expect(known.has(method.expected.type), `unknown finding type ${method.expected.type}`).toBe(
        true,
      );
    }
  });

  it("has unique method ids across the module", () => {
    const ids = allMethods.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a vanilla renderer for every catalog method (catalog ↔ renderer lockstep)", () => {
    const renderable = new Set(RENDERER_METHOD_IDS);
    for (const method of allMethods) {
      expect(renderable.has(method.id), `no renderer for method ${method.id}`).toBe(true);
    }
  });
});

describe("generateProblems", () => {
  const catalog = assertTechniques(realCatalog, "catalog");
  const allMethodIds = catalog.techniques.flatMap((t) => t.methods.map((m) => m.id));

  it("authors every catalog method (catalog ↔ generator lockstep)", () => {
    const problems = generateProblems(catalog, { seed: "s", enabledMethods: allMethodIds });
    expect(problems).toHaveLength(allMethodIds.length);
  });

  it("is deterministic for the same seed", () => {
    const a = generateProblems(catalog, { seed: "seed-1" });
    const b = generateProblems(catalog, { seed: "seed-1" });
    expect(a).toEqual(b);
  });

  it("varies text and params across seeds", () => {
    const a = generateProblems(catalog, { seed: "seed-1" });
    const b = generateProblems(catalog, { seed: "seed-2" });
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it("emits the answer key: positives fire with a finding type, benign controls do not", () => {
    const problems = generateProblems(catalog, { seed: "answer-key" });
    for (const p of problems) {
      if (p.benign) {
        expect(p.expected.shouldFire).toBe(false);
        expect(p.expected.findingType).toBeNull();
      } else {
        expect(p.expected.shouldFire).toBe(true);
        expect(p.expected.findingType).not.toBeNull();
      }
    }
  });

  it("honours the enabled-method subset", () => {
    const problems = generateProblems(catalog, { seed: "x", enabledMethods: ["display-none"] });
    expect(problems).toHaveLength(1);
    expect(problems[0]!.methodId).toBe("display-none");
  });

  it("ignores unknown method ids rather than throwing", () => {
    const problems = generateProblems(catalog, { seed: "x", enabledMethods: ["nope", "offscreen"] });
    expect(problems).toHaveLength(1);
    expect(problems[0]!.methodId).toBe("offscreen");
  });
});
