import type { Rng } from "../engine/random.ts";

/**
 * Context handed to a scenario behavior module's `run()`. Behaviors are the deliberately
 * messy, interactive, seed-driven part of a scenario (buttons, timed DOM mutations, imperfect
 * markup) and are NOT unit-tested (see AGENTS.md). `rng` makes any randomness reproducible.
 */
export interface ScenarioContext {
  /** The active seed string (from `?seed=`). */
  seed: string;
  /** Seeded PRNG derived from `seed`; use instead of `Math.random` for scenario content. */
  rng: Rng;
  /** The scenario content container (`.app-main`). */
  root: HTMLElement;
}
