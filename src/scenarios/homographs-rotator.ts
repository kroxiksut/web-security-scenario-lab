import type { ScenarioContext } from "./context.ts";

// Homograph / mixed-script candidates for the "mismatch" card. Reserved domains only
// (RFC 2606 `.example`); these never resolve to a live host.
const HOMOGRAPH_CANDIDATES = [
  "https://trռsted-bank.example", // Armenian small letter u lookalike
  "https://truѕted-bank.example", // Cyrillic small letter dze
  "https://xn--trusted-bank-1a.example", // punycode-looking label
  "https://trusted‐bank.example", // hyphen lookalike
];

/** What the anchor text claims — plain ASCII, visually identical to the deceptive candidates. */
const CLAIMED_TARGET = "https://trusted-bank.example";

/**
 * Seeded homograph rotation. The deception is encoded in the anchor itself: the visible text claims
 * `CLAIMED_TARGET` while `href` carries a mixed-script / punycode / lookalike-punctuation variant,
 * so `link-target-mismatch` is detectable from the DOM the way a real page would express it. The
 * metadata rows are a reviewer-facing readout of that same pair, not the signal itself.
 */
export function run({ rng, root }: ScenarioContext): void {
  const card = root.querySelector<HTMLElement>(".lds-link--mismatch");
  const anchor = card?.querySelector<HTMLAnchorElement>(".lds-link-target");
  if (anchor) {
    const candidate = rng.pick(HOMOGRAPH_CANDIDATES);
    anchor.setAttribute("href", candidate);
    anchor.textContent = CLAIMED_TARGET;
    const actual = card?.querySelector<HTMLElement>(".lds-domain--mixed-script");
    if (actual) actual.textContent = candidate;
  }

  const debug = root.querySelector<HTMLElement>(".lds-debug");
  if (debug) debug.textContent = "Debug: candidate-set=homograph-v1 (seed-reproducible)";
}
