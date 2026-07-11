import { describe, it, expect } from "vitest";
import { createRng, mulberry32, xmur3 } from "../../src/engine/random.ts";

describe("seeded PRNG", () => {
  it("is deterministic: same seed -> same sequence", () => {
    const a = mulberry32(1042);
    const b = mulberry32(1042);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("different seeds produce different sequences", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toEqual(b());
  });

  it("emits floats in [0, 1)", () => {
    const next = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("string seeds are stable via xmur3", () => {
    expect(xmur3("hidden-text-mixed")).toEqual(xmur3("hidden-text-mixed"));
    expect(xmur3("a")).not.toEqual(xmur3("b"));
  });

  it("createRng helpers stay within bounds and are reproducible", () => {
    const r1 = createRng("scenario-seed");
    const r2 = createRng("scenario-seed");
    const items = ["x", "y", "z"] as const;
    for (let i = 0; i < 100; i++) {
      const n = r1.int(3, 9);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(9);
      expect(items).toContain(r1.pick(items));
      expect(typeof r1.bool()).toBe("boolean");
    }
    // Same seed reproduces the same first draw.
    expect(createRng(42).int(0, 1000)).toEqual(createRng(42).int(0, 1000));
    expect(r2.int(3, 9)).toBeGreaterThanOrEqual(3);
  });
});
