import type { ScenarioContext } from "../context.ts";
import type { Rng } from "../../engine/random.ts";
import { TRIGGER_PHRASES, localizePhrase, type TriggerPhrase } from "./triggerCorpus.ts";

/**
 * Shared driver for `trigger-phrases` positive scenarios. It plants synthetic trigger phrases (see
 * `triggerCorpus.ts`) into the page as visible text AND into text-bearing attributes (`title`,
 * `aria-label`, `alt`) — the surfaces PageCheck's trigger-phrases module documents as in scope —
 * and adds an interactive, seeded, sometimes-delayed injector to exercise the detector's mutation
 * queue. An optional `transform` obfuscates each planted string (e.g. Unicode normalization
 * evasion), so one driver serves both the plain and the evasion variants (param-injection shape,
 * like the framework drivers).
 *
 * Both EN and RU phrases are planted regardless of the UI locale: the page's job is to present the
 * payload for the detector to scan, and EN/RU parity is a coverage dimension, not a UI concern.
 */

/** 1×1 transparent PNG — lets an <img alt="…"> carry an alt-text payload with no network request. */
const BLANK_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export type Placement = "text" | "title" | "aria-label" | "alt";
const PLACEMENTS: readonly Placement[] = ["text", "title", "aria-label", "alt"];

export interface TriggerPlantOptions {
  /** Applied to each planted phrase string before it hits the DOM. Defaults to identity. */
  transform?: (text: string, rng: Rng) => string;
  /** Short label shown on each planted item's meta line (e.g. "plain", "unicode-evasion"). */
  variantTag: string;
}

/** Build the meta line describing a planted item (category · placement · lang · variant). */
function metaLine(phrase: TriggerPhrase, placement: Placement, lang: string, variant: string): HTMLElement {
  const meta = document.createElement("p");
  meta.className = "muted tp-meta";
  meta.textContent = `lab-marker · ${phrase.category} · ${placement} · ${lang} · ${variant}`;
  return meta;
}

/** Plant one phrase into `container` at `placement`, applying `transform`. Returns the host node. */
function plantPhrase(
  container: HTMLElement,
  phrase: TriggerPhrase,
  lang: "en" | "ru",
  placement: Placement,
  transform: (text: string, rng: Rng) => string,
  rng: Rng,
  variant: string,
): void {
  const raw = localizePhrase(phrase, lang);
  const text = transform(raw, rng);

  const item = document.createElement("div");
  item.className = "tp-item";
  item.appendChild(metaLine(phrase, placement, lang, variant));

  if (placement === "text") {
    const p = document.createElement("p");
    p.className = "tp-phrase";
    p.textContent = text;
    item.appendChild(p);
  } else if (placement === "alt") {
    const img = document.createElement("img");
    img.src = BLANK_PNG;
    img.width = 16;
    img.height = 16;
    img.alt = text;
    item.appendChild(img);
  } else {
    // title / aria-label: a visible control whose accessible/tooltip text carries the payload.
    const span = document.createElement("span");
    span.className = "tp-phrase tp-attr-host";
    span.textContent = "▣ hover / a11y target";
    span.setAttribute(placement, text);
    item.appendChild(span);
  }

  container.appendChild(item);
}

/**
 * Run a trigger-phrases positive scenario into `.tp-playground`. Plants a fixed bilingual baseline,
 * a seeded spread across categories/placements, and an interactive injector button.
 */
export function runTriggerPhrases(ctx: ScenarioContext, options: TriggerPlantOptions): void {
  const { rng, root } = ctx;
  const transform = options.transform ?? ((t) => t);
  const variant = options.variantTag;
  const playground = root.querySelector<HTMLElement>(".tp-playground");
  if (!playground) return;

  // Fixed bilingual baseline: the same instruction-override phrase in EN and RU as visible text —
  // a naive detector should catch both, and both should collapse to one finding family.
  const baseline = TRIGGER_PHRASES.find((p) => p.id === "override-basic");
  if (!baseline) return;
  plantPhrase(playground, baseline, "en", "text", transform, rng, variant);
  plantPhrase(playground, baseline, "ru", "text", transform, rng, variant);

  // Seeded spread: pick a handful of other phrases and scatter them across placements/languages.
  const pool = TRIGGER_PHRASES.filter((p) => p.id !== baseline.id);
  const count = rng.int(3, Math.min(5, pool.length));
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const phrase = rng.pick(pool);
    if (used.has(phrase.id)) continue;
    used.add(phrase.id);
    const lang: "en" | "ru" = rng.bool() ? "en" : "ru";
    const placement = rng.pick(PLACEMENTS);
    plantPhrase(playground, phrase, lang, placement, transform, rng, variant);
  }

  // Interactive injector: appends a seeded phrase, sometimes into an attribute, sometimes after a
  // short delay — the event-driven, timed DOM mutation the detector's mutation queue must survive.
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = "Inject trigger phrase";
  button.addEventListener("click", () => {
    const phrase = rng.pick(TRIGGER_PHRASES);
    const lang: "en" | "ru" = rng.bool() ? "en" : "ru";
    const placement = rng.pick(PLACEMENTS);
    const doPlant = (): void => plantPhrase(playground, phrase, lang, placement, transform, rng, variant);
    if (rng.bool()) window.setTimeout(doPlant, rng.int(50, 500));
    else doPlant();
  });
  playground.insertAdjacentElement("afterend", button);
}
