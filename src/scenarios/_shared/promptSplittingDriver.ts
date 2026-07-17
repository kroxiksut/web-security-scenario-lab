import type { ScenarioContext } from "../context.ts";
import type { Rng } from "../../engine/random.ts";
import { phraseById, localizePhrase, type TriggerPhrase } from "./triggerCorpus.ts";

/**
 * Shared driver for `prompt-splitting` positive scenarios.
 *
 * Prompt splitting distributes one instruction across several nearby DOM fragments so a single-string
 * check misses it. This driver takes a phrase from the shared corpus (`triggerCorpus.ts` — the same
 * source `trigger-phrases` uses) and breaks it into 2–4 consecutive sibling fragments inside ONE
 * region container (same local structural anchor, homogeneous DOM-text source) — the shape PageCheck's
 * prompt-splitting module reconstructs. `style` selects the assembly the fragments imply:
 *  - `spaced`   — split at word boundaries, whitespace between fragments → boundary-aware / spaced
 *                 assembly (the eligible, higher-confidence case).
 *  - `compact`  — split mid-word with no whitespace and letter/digit-adjacent boundaries → compact
 *                 assembly (the module caps this to weak confidence).
 *
 * A seeded, delayed injector appends further split regions over time to exercise the detector's
 * mutation queue (its P8-DOM-ADD dynamic-reconstruction path).
 */

export type SplitStyle = "spaced" | "compact";

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

/** Split at word boundaries into `parts` contiguous groups; spaced-join recovers the phrase. */
function splitSpaced(text: string, parts: number, rng: Rng): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.min(parts, words.length);
  if (n <= 1) return [text];
  const cutSet = new Set<number>();
  while (cutSet.size < n - 1) cutSet.add(rng.int(1, words.length - 1));
  const cuts = [...cutSet].sort((a, b) => a - b);
  const groups: string[] = [];
  let prev = 0;
  for (const c of cuts) {
    groups.push(words.slice(prev, c).join(" "));
    prev = c;
  }
  groups.push(words.slice(prev).join(" "));
  return groups;
}

/** Indices where both neighbouring code points are letters/digits — valid compact cut points. */
function letterBoundaryIndices(chars: string[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < chars.length; i++) {
    const a = chars[i - 1];
    const b = chars[i];
    if (a && b && LETTER_OR_DIGIT.test(a) && LETTER_OR_DIGIT.test(b)) out.push(i);
  }
  return out;
}

/** Pick `n` roughly-even indices out of a sorted candidate list, with seeded jitter. */
function pickSpread(items: number[], n: number, rng: Rng): number[] {
  const res = new Set<number>();
  const bucket = items.length / n;
  for (let i = 0; i < n; i++) {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    const pick = items[rng.int(start, Math.min(end, items.length) - 1)];
    if (pick !== undefined) res.add(pick);
  }
  return [...res].sort((a, b) => a - b);
}

/** Split mid-word (no whitespace at cuts, letter/digit-adjacent) into up to `parts` fragments. */
function splitCompact(text: string, parts: number, rng: Rng): string[] {
  const chars = Array.from(text);
  const candidates = letterBoundaryIndices(chars);
  const nCuts = Math.min(parts - 1, candidates.length);
  if (nCuts <= 0) return [text];
  const chosen = pickSpread(candidates, nCuts, rng);
  const frags: string[] = [];
  let prev = 0;
  for (const c of chosen) {
    frags.push(chars.slice(prev, c).join(""));
    prev = c;
  }
  frags.push(chars.slice(prev).join(""));
  return frags.filter(Boolean);
}

/** Build one region element holding the fragments as consecutive sibling spans. */
function buildRegion(
  fragments: string[],
  style: SplitStyle,
  phrase: TriggerPhrase,
  lang: string,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "ps-item";

  const meta = document.createElement("p");
  meta.className = "muted ps-meta";
  meta.textContent = `lab-marker · ${phrase.category} · ${style} · ${lang} · ${fragments.length} fragments`;
  wrap.appendChild(meta);

  const region = document.createElement("p");
  region.className = "ps-region";
  fragments.forEach((frag, i) => {
    if (i > 0 && style === "spaced") region.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "ps-fragment";
    span.textContent = frag;
    region.appendChild(span);
  });
  wrap.appendChild(region);
  return wrap;
}

function fragmentsFor(text: string, style: SplitStyle, rng: Rng): string[] {
  const parts = rng.int(2, 4);
  return style === "spaced" ? splitSpaced(text, parts, rng) : splitCompact(text, parts, rng);
}

export interface SplitPositiveOptions {
  style: SplitStyle;
}

/**
 * Run a prompt-splitting positive scenario into `.ps-playground`. Plants one EN and one RU region
 * (each a single homogeneous DOM-text chain) plus a seeded, delayed injector.
 */
export function runPromptSplitPositive(ctx: ScenarioContext, options: SplitPositiveOptions): void {
  const { rng, root } = ctx;
  const { style } = options;
  const playground = root.querySelector<HTMLElement>(".ps-playground");
  if (!playground) return;

  const phrase = phraseById("override-basic");
  if (!phrase) return;

  // One EN region and one RU region — each an independent single-region split chain.
  for (const lang of ["en", "ru"] as const) {
    const text = localizePhrase(phrase, lang);
    playground.appendChild(buildRegion(fragmentsFor(text, style, rng), style, phrase, lang));
  }

  // Interactive delayed assembler: appends a new split region, inserting its fragments one at a time
  // on seeded timers — the dynamic reconstruction the detector's mutation queue must survive.
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Assemble split region (delayed)";
  button.addEventListener("click", () => {
    const lang: "en" | "ru" = rng.bool() ? "en" : "ru";
    const text = localizePhrase(phrase, lang);
    const fragments = fragmentsFor(text, style, rng);

    const wrap = document.createElement("div");
    wrap.className = "ps-item";
    const meta = document.createElement("p");
    meta.className = "muted ps-meta";
    meta.textContent = `lab-marker · ${phrase.category} · ${style} · ${lang} · delayed assembly`;
    wrap.appendChild(meta);
    const region = document.createElement("p");
    region.className = "ps-region";
    wrap.appendChild(region);
    playground.appendChild(wrap);

    // Insert fragments over time so the full instruction only exists after several mutations.
    fragments.forEach((frag, i) => {
      window.setTimeout(
        () => {
          if (i > 0 && style === "spaced") region.appendChild(document.createTextNode(" "));
          const span = document.createElement("span");
          span.className = "ps-fragment";
          span.textContent = frag;
          region.appendChild(span);
        },
        rng.int(60, 260) * (i + 1),
      );
    });
  });
  playground.insertAdjacentElement("afterend", button);
}
