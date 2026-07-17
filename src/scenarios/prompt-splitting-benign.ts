import type { ScenarioContext } from "./context.ts";
import { phraseById, localizePhrase } from "./_shared/triggerCorpus.ts";

/**
 * Benign false-positive control for prompt-splitting (`shouldFire: false`).
 *
 * Two constructions the module must NOT report as a split instruction:
 *  1. The phrase's words scattered across SEPARATE regions (distinct structural anchors, unrelated
 *     content between them). Reconstruction only walks candidates that share one local region, so
 *     cross-region fragments never assemble.
 *  2. The COMPLETE phrase inside a single node. A complete match in one fragment is out of scope for
 *     prompt-splitting (it belongs to trigger-phrases), so this module must stay silent.
 */
export function run({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".ps-playground");
  if (!playground) return;

  const phrase = phraseById("override-basic");
  if (!phrase) return;
  const lang: "en" | "ru" = rng.bool() ? "en" : "ru";
  const words = localizePhrase(phrase, lang).split(/\s+/).filter(Boolean);

  // 1) Cross-region scatter: each fragment lives in its own section with filler between — different
  //    local anchors, so the fragments are never "nearby candidates in one region".
  const intro = document.createElement("p");
  intro.className = "muted ps-meta";
  intro.textContent = `lab-marker · benign · cross-region scatter · ${lang}`;
  playground.appendChild(intro);

  const mid = Math.max(1, Math.ceil(words.length / 3));
  const groups = [words.slice(0, mid), words.slice(mid, mid * 2), words.slice(mid * 2)].filter(
    (g) => g.length > 0,
  );
  groups.forEach((group, i) => {
    const section = document.createElement("section");
    section.className = "ps-benign-region";
    const frag = document.createElement("p");
    frag.className = "ps-fragment";
    frag.textContent = group.join(" ");
    section.appendChild(frag);
    playground.appendChild(section);

    if (i < groups.length - 1) {
      const filler = document.createElement("p");
      filler.textContent =
        lang === "ru"
          ? "Обычный абзац контента между несвязанными разделами."
          : "Ordinary content paragraph between unrelated sections.";
      playground.appendChild(filler);
    }
  });

  // 2) Complete phrase in a single node — trigger-phrases' concern, not prompt-splitting's.
  const complete = document.createElement("p");
  complete.className = "ps-fragment";
  complete.dataset.note = "complete-single-node";
  complete.textContent = localizePhrase(phrase, lang);
  playground.appendChild(complete);
}
