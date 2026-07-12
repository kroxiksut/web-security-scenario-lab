import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import {
  assertFrameworks,
  validateFrameworks,
} from "../../src/engine/validateFrameworks.ts";
import type { FrameworkMatrix } from "../../src/engine/types.ts";

const scenarioDir = new URL("../../data/scenarios/", import.meta.url);
const realMatrix = JSON.parse(
  readFileSync(new URL("../../data/frameworks.json", import.meta.url), "utf8"),
) as unknown;

describe("framework matrix validation", () => {
  it("accepts the real data/frameworks.json matrix", () => {
    const { valid, errors } = validateFrameworks(realMatrix);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it("rejects a version pinned with a caret range (stale/legacy must stay intentional)", () => {
    const bad = structuredClone(realMatrix) as FrameworkMatrix;
    bad.frameworks[0]!.versions[0]!.version = "^3.7.1";
    expect(validateFrameworks(bad).valid).toBe(false);
  });

  it("rejects a folder that is not a versioned segment", () => {
    const bad = structuredClone(realMatrix) as FrameworkMatrix;
    bad.frameworks[0]!.versions[0]!.folder = "latest";
    expect(validateFrameworks(bad).valid).toBe(false);
  });

  it("rejects a version missing required fields", () => {
    const bad = structuredClone(realMatrix) as FrameworkMatrix;
    // @ts-expect-error deliberately dropping a required field
    delete bad.frameworks[0]!.versions[0]!.whyIncluded;
    expect(validateFrameworks(bad).valid).toBe(false);
  });

  it("rejects a scenario ref whose page is not an .html path", () => {
    const bad = structuredClone(realMatrix) as FrameworkMatrix;
    bad.frameworks[0]!.versions[0]!.scenarios[0]!.page = "frameworks/jquery/v3/hidden-text";
    expect(validateFrameworks(bad).valid).toBe(false);
  });

  it("assertFrameworks throws readable errors on invalid input", () => {
    expect(() => assertFrameworks({ frameworks: [] }, "test")).toThrow(
      /Invalid framework matrix test/,
    );
  });
});

describe("framework matrix referential integrity", () => {
  const matrix = assertFrameworks(realMatrix, "data/frameworks.json");

  it("has unique framework ids", () => {
    const ids = matrix.frameworks.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses a unique folder per version within each framework (one version per page)", () => {
    for (const fw of matrix.frameworks) {
      const folders = fw.versions.map((v) => v.folder);
      expect(new Set(folders).size, `${fw.id} has duplicate folders`).toBe(folders.length);
    }
  });

  it("references only scenarios that ship a manifest in data/scenarios", () => {
    for (const fw of matrix.frameworks) {
      for (const version of fw.versions) {
        for (const ref of version.scenarios) {
          const manifest = new URL(`${ref.id}.json`, scenarioDir);
          expect(
            existsSync(manifest),
            `${fw.id}@${version.version} → missing manifest ${ref.id}.json`,
          ).toBe(true);
        }
      }
    }
  });

  it("points every scenario ref at an HTML page that exists", () => {
    for (const fw of matrix.frameworks) {
      for (const version of fw.versions) {
        for (const ref of version.scenarios) {
          const pagePath = new URL(`../../${ref.page}`, import.meta.url);
          expect(existsSync(pagePath), `${fw.id}@${version.version} → missing page ${ref.page}`).toBe(
            true,
          );
        }
      }
    }
  });
});
