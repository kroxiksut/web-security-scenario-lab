/**
 * Deterministic, seeded pseudo-random generator for reproducible scenarios.
 *
 * Reproducibility is a core requirement: the same `seed` must always produce the same
 * scenario variant (see SCENARIO-DYNAMICS.md). We therefore never use `Math.random()` in
 * scenario generation — always an instance created here.
 *
 * `mulberry32` is a compact, well-distributed 32-bit PRNG; `xmur3` hashes a string seed
 * (e.g. `?seed=hidden-text-mixed`) into the 32-bit integer mulberry32 expects.
 */

/** Hash an arbitrary string into a 32-bit unsigned integer seed. */
export function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

/** Create a PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A small deterministic RNG with convenience helpers. */
export interface Rng {
  /** Next float in [0, 1). */
  next(): number;
  /** Integer in [min, max]. */
  int(min: number, max: number): number;
  /** Uniformly pick one element (throws on empty array). */
  pick<T>(items: readonly T[]): T;
  /** True with probability `p` (default 0.5). */
  bool(p?: number): boolean;
}

/** Build an {@link Rng} from a numeric or string seed. */
export function createRng(seed: number | string): Rng {
  const numericSeed = typeof seed === "number" ? seed >>> 0 : xmur3(seed);
  const next = mulberry32(numericSeed);
  return {
    next,
    int(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("createRng().pick: empty array");
      return items[Math.floor(next() * items.length)] as T;
    },
    bool(p = 0.5): boolean {
      return next() < p;
    },
  };
}
