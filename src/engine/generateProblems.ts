/**
 * Seeded, technique-agnostic problem generator — the pure core of the module playground.
 *
 * Given a technique catalog, a seed, and the set of enabled method ids, it emits a reproducible
 * list of {@link Problem} specs: each carries the (unique, seeded) text, the authored per-method
 * params (geometry/colours/sizes), a decoy slot, and the expected finding. A framework-agnostic
 * *renderer* turns a `Problem[]` into DOM through whichever runtime is selected — so this file owns
 * ALL randomness (and is unit-tested for determinism), while renderers stay dumb DOM appliers.
 *
 * No `Math.random()` — reproducibility per seed is a hard requirement (see random.ts). The same
 * seed + same enabled set always yields byte-identical specs.
 */

import { createRng, type Rng } from "./random.ts";
import type { FindingType, TechniqueCatalog, TechniqueMethod } from "./techniqueCatalog.ts";
import type { Severity } from "./types.ts";

/** One generated problem — the unit both the renderer and the answer-key panel consume. */
export interface Problem {
  techniqueId: string;
  methodId: string;
  benign: boolean;
  /** Unique, seeded, human-readable text placed into the DOM (never identical across rerolls). */
  text: string;
  /** Seeded short marker embedded in the text and usable as a data attribute for tracing. */
  marker: string;
  /** Which decoy-environment injection slot this problem lands in. */
  slot: number;
  /** Per-method rendering params authored here so the renderer carries no randomness. */
  params: Record<string, string | number | boolean>;
  /** The answer-key row: what the detector should (or should not) report. */
  expected: {
    shouldFire: boolean;
    findingType: FindingType | null;
    detector: string | null;
    severity: Severity | null;
  };
}

export interface GenerateOptions {
  seed: string | number;
  /** Catalog method ids to include; defaults to every method in the catalog. */
  enabledMethods?: readonly string[];
  /** Number of decoy injection slots the environment exposes (problems are spread across them). */
  slots?: number;
}

// Clearly lab-benign "smuggled" text. Suspicious-looking but harmless — never real instructions.
const SUSPICIOUS_TEXT = [
  "lab-marker: this line is visually suppressed for detector testing",
  "hidden note (test): a human reader should not see this paragraph",
  "off-screen smuggled text sample — evaluation placeholder only",
  "low-contrast injected instruction placeholder (lab fixture)",
  "concealed reviewer-only annotation, present for the scanner to find",
];

// Legitimate copy for benign controls — the detector must NOT flag these.
const BENIGN_TEXT = [
  "Skip to main content",
  "Search",
  "Menu",
  "Toggle navigation",
  "Opens in a new tab",
];

/** Seeded 6-char marker so no two problems (or rerolls) carry identical text. */
function makeMarker(rng: Rng): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) out += rng.int(0, 35).toString(36);
  return `lab-${out}`;
}

function hex(channel: number): string {
  return Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0");
}

/**
 * Per-method param authors. Keyed by catalog method id; each consumes the rng to produce the
 * geometry/colour/size the renderer applies. Adding a method to the catalog without an author here
 * throws in {@link generateProblems} — caught by `tests/unit/techniques.test.ts`, keeping the
 * catalog and the generator in lockstep.
 */
const AUTHORS: Record<string, (rng: Rng) => Problem["params"]> = {
  "display-none": (rng) => ({ wrapper: rng.pick(["self", "ancestor"]) }),
  "visibility-hidden": (rng) => ({ wrapper: rng.pick(["self", "ancestor"]) }),
  "opacity-zero": (rng) => ({ wrapper: rng.pick(["self", "ancestor"]) }),
  "low-contrast": (rng) => {
    // Near-match colours: distance stays ≤ ~15 so hiddenTextDetector's near-match branch fires
    // without needing extra context signals.
    const base = [rng.int(120, 220), rng.int(120, 220), rng.int(120, 220)];
    const near = base.map((c) => c + rng.int(-5, 5));
    return {
      color: `#${hex(base[0]!)}${hex(base[1]!)}${hex(base[2]!)}`,
      background: `#${hex(near[0]!)}${hex(near[1]!)}${hex(near[2]!)}`,
    };
  },
  "font-size-zero": (rng) => ({ px: rng.pick([0, 0.1, 1]) }),
  "negative-text-indent": (rng) => ({
    indent: -rng.int(4000, 9999),
    overflowHidden: rng.bool(),
    nowrap: rng.bool(0.7),
  }),
  offscreen: (rng) => ({
    axis: rng.pick(["x", "y"]),
    offset: -rng.int(4000, 9999),
  }),
  "benign-sr-only": () => ({}),
  "benign-small-decorative": (rng) => ({ px: rng.pick([1, 2]), tag: rng.pick(["sup", "badge"]) }),
  // style-obfuscation
  clipping: (rng) => ({ shape: rng.pick(["inset", "rect", "circle"]) }),
  "transform-scale": (rng) => ({ fn: rng.pick(["scale", "scaleX", "scaleY"]) }),
  filter: (rng) => ({ kind: rng.pick(["blur", "brightness", "contrast"]) }),
  "aria-hidden": () => ({}),
  "bidi-override": (rng) => ({ dir: rng.pick(["rtl", "ltr"]) }),
  "pseudo-content": () => ({}),
  "text-security": (rng) => ({ mask: rng.pick(["disc", "circle", "square"]) }),
  // hidden-input
  "hidden-text-input": (rng) => ({ hide: rng.pick(["offscreen", "display-none"]) }),
  "hidden-consent": () => ({}),
  "hidden-editable": () => ({}),
};

/**
 * Generate the reproducible problem set for a module playground. Emits one problem per enabled
 * method (a predictable answer-key size), with seeded text, geometry, and slot placement, then
 * shuffles injection order by a seeded key so placement varies while coverage stays fixed.
 */
export function generateProblems(catalog: TechniqueCatalog, options: GenerateOptions): Problem[] {
  const rng = createRng(options.seed);
  const slots = options.slots ?? 6;

  const byId = new Map<string, { techniqueId: string; method: TechniqueMethod }>();
  for (const technique of catalog.techniques) {
    for (const method of technique.methods) {
      byId.set(method.id, { techniqueId: technique.id, method });
    }
  }

  const enabled = options.enabledMethods ?? [...byId.keys()];

  const built: { problem: Problem; order: number }[] = [];
  for (const methodId of enabled) {
    const entry = byId.get(methodId);
    if (!entry) continue; // unknown id in the URL/UI — ignore rather than break the page
    const author = AUTHORS[methodId];
    if (!author) throw new Error(`generateProblems: no param author for method "${methodId}"`);

    const { techniqueId, method } = entry;
    const marker = makeMarker(rng);
    const pool = method.benign ? BENIGN_TEXT : SUSPICIOUS_TEXT;
    const text = `${rng.pick(pool)} [${marker}]`;
    const params = author(rng);
    const slot = rng.int(0, Math.max(0, slots - 1));
    const order = rng.next();

    built.push({
      order,
      problem: {
        techniqueId,
        methodId,
        benign: method.benign,
        text,
        marker,
        slot,
        params,
        expected: {
          shouldFire: method.shouldFire,
          findingType: method.expected?.type ?? null,
          detector: method.expected?.detector ?? null,
          severity: method.expected?.severity ?? null,
        },
      },
    });
  }

  return built.sort((a, b) => a.order - b.order).map((b) => b.problem);
}
