import type { ScenarioContext } from "./context.ts";

/**
 * Benign false-positive control for link-domain-security (`shouldFire: false`).
 *
 * Every link on this page is honest, but each one trips a *naive* version of one of the module's
 * heuristics: a legitimate internationalized domain looks like a homograph, its punycode form looks
 * like an attack, a same-site `next=` parameter looks like an open redirect, and a link whose text
 * is a label rather than a URL has nothing to mismatch against. A finding here would be a false
 * positive. All hosts are RFC 2606 reserved names that never resolve.
 */

interface BenignLink {
  /** Visible anchor text. */
  text: string;
  /** Actual href. */
  href: string;
  /** Reviewer-facing note explaining which naive heuristic this guards against. */
  note: string;
}

// Single-script internationalized domains. These are NOT homographs: nothing here mixes scripts to
// impersonate a Latin name — the label is simply written in its own language, and the visible text
// matches the target exactly.
const IDN_LINKS: BenignLink[] = [
  {
    text: "https://münchen.example",
    href: "https://münchen.example",
    note: "Legitimate IDN (German umlaut, single script) — visible text equals the target.",
  },
  {
    text: "https://пример.example",
    href: "https://пример.example",
    note: "Legitimate all-Cyrillic IDN — no script mixing, nothing impersonated.",
  },
  {
    text: "https://例え.example",
    href: "https://例え.example",
    note: "Legitimate Japanese IDN — non-ASCII alone is not deception.",
  },
];

const FIXED_LINKS: BenignLink[] = [
  {
    text: "https://portal.example",
    href: "https://portal.example",
    note: "Plain matching link — the control case.",
  },
  {
    text: "portal.example",
    href: "https://portal.example/account/settings",
    note: "Same host, deeper path — a differing path is not a target mismatch.",
  },
  {
    text: "Open the documentation",
    href: "https://docs.example/getting-started",
    note: "Label text claims no hostname, so there is nothing to compare it against.",
  },
  {
    text: "Continue to the module catalog",
    href: "./index.html?next=./homographs.html",
    note: "Redirect-style parameter pointing back into the lab — same origin, not an open redirect.",
  },
  {
    text: "support@portal.example",
    href: "mailto:support@portal.example",
    note: "Non-HTTP scheme that is not an unsafe protocol.",
  },
];

function renderCard(link: BenignLink): HTMLElement {
  const card = document.createElement("article");
  card.className = "lds-link-card lds-link--benign";

  const anchor = document.createElement("a");
  anchor.setAttribute("href", link.href);
  anchor.textContent = link.text;
  card.appendChild(anchor);

  const meta = document.createElement("div");
  meta.className = "lds-link-meta";

  const hrefRow = document.createElement("div");
  const hrefLabel = document.createElement("span");
  hrefLabel.className = "lds-label";
  hrefLabel.textContent = "href";
  const hrefValue = document.createElement("span");
  hrefValue.className = "lds-domain";
  hrefValue.textContent = link.href;
  hrefRow.append(hrefLabel, hrefValue);

  const noteRow = document.createElement("div");
  noteRow.className = "lds-note";
  noteRow.textContent = link.note;

  meta.append(hrefRow, noteRow);
  card.appendChild(meta);
  return card;
}

export function run({ rng, root }: ScenarioContext): void {
  const grid = root.querySelector<HTMLElement>(".lds-link-grid");
  if (!grid) return;

  // One internationalized domain per seed, so the "looks non-ASCII, must be an attack" case varies
  // reproducibly; the honest links around it stay fixed.
  const idn = rng.pick(IDN_LINKS);
  [...FIXED_LINKS.slice(0, 2), idn, ...FIXED_LINKS.slice(2)].forEach((link) => {
    grid.appendChild(renderCard(link));
  });

  const debug = root.querySelector<HTMLElement>(".lds-debug");
  if (debug) debug.textContent = `Debug: benign-set=links-v1; idn=${idn.href} (seed-reproducible)`;
}
