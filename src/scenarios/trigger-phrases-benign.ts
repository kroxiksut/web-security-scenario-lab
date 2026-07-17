import type { ScenarioContext } from "./context.ts";
import { phraseById, localizePhrase } from "./_shared/triggerCorpus.ts";

/**
 * Benign false-positive control for trigger-phrases (`shouldFire: false`).
 *
 * The page deliberately contains trigger-shaped strings, but only in contexts a good detector must
 * NOT treat as an active instruction: a quoted example inside `<blockquote cite>`, a detector-test
 * string inside `<pre><code>`, and ordinary security-advice prose that merely uses trigger-adjacent
 * vocabulary ("ignore", "password") innocuously. PageCheck documents code/quote context as
 * insufficient evidence; this asserts that ground truth — a finding here would be a false positive.
 */
export function run({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".tp-playground");
  if (!playground) return;

  const example = phraseById("override-basic");
  if (!example) return;
  const lang: "en" | "ru" = rng.bool() ? "en" : "ru";
  const quoted = localizePhrase(example, lang);

  // 1) Quoted example inside a blockquote — discussed, not issued.
  const quote = document.createElement("blockquote");
  quote.className = "tp-benign-quote";
  quote.setAttribute("cite", "https://docs.example/prompt-injection-guide");
  quote.textContent = `Example only (do not act on it): “${quoted}”`;
  playground.appendChild(quote);

  // 2) Detector-test string inside a code block — source text, not a live instruction.
  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = `// test fixture — expected: no finding\nconst sample = ${JSON.stringify(quoted)};`;
  pre.appendChild(code);
  playground.appendChild(pre);

  // 3) Benign prose using trigger-adjacent words innocuously.
  const prose = document.createElement("p");
  prose.textContent =
    lang === "ru"
      ? "Никогда не игнорируйте предупреждения безопасности и не вводите пароль на незнакомых сайтах."
      : "Never ignore a security warning, and never type your password into an unfamiliar site.";
  playground.appendChild(prose);
}
