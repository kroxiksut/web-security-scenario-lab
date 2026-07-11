import type { ScenarioContext } from "./context.ts";

// Homograph / mixed-script candidates for the "mismatch" card. Reserved domains only
// (RFC 2606 `.example`); these never resolve to a live host.
const HOMOGRAPH_CANDIDATES = [
  "https://trռsted-bank.example", // Armenian small letter u lookalike
  "https://truѕted-bank.example", // Cyrillic small letter dze
  "https://xn--trusted-bank-1a.example", // punycode-looking label
  "https://trusted‐bank.example", // hyphen lookalike
];

/**
 * Seeded homograph rotation. Picks a mixed-script/punycode candidate for the visible/href
 * mismatch card so the exact deceptive domain varies per seed while staying reproducible.
 */
export function run({ rng, root }: ScenarioContext): void {
  const mismatch = root.querySelector<HTMLElement>(".lds-link--mismatch .lds-domain");
  if (mismatch) mismatch.textContent = rng.pick(HOMOGRAPH_CANDIDATES);

  const debug = root.querySelector<HTMLElement>(".lds-debug");
  if (debug) debug.textContent = "Debug: candidate-set=homograph-v1 (seed-reproducible)";
}
