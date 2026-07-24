/**
 * Decoy page environment for the playground. Instead of dropping the generated problems into an
 * obvious test box, we weave them into a realistic, benign-looking article page (header, nav, body
 * copy, comments, footer) — which is how smuggled content appears in the wild and is meaningfully
 * harder for a detector to isolate. An "isolated" mode keeps a plain container for pinpoint testing.
 *
 * The environment exposes a fixed set of injection `slots`; the seeded generator decides which slot
 * each problem lands in. All copy here is benign filler (no reserved-domain / brand concerns).
 */

export type EnvironmentMode = "woven" | "isolated";

export interface DecoyEnvironment {
  root: HTMLElement;
  /** Injection points the renderer fills; index maps to `Problem.slot`. */
  slots: HTMLElement[];
}

const ARTICLE_PARAGRAPHS = [
  "Static-server rendering keeps the lab reproducible across machines, so a scenario looks the same whether it is served on Windows or Linux.",
  "Each run is driven by a seed, which means the same address always reconstructs the same page — useful when comparing detector output over time.",
  "The surrounding article is ordinary filler content. It exists only to give the injected problems a plausible place to hide.",
  "A reader skimming this column would have no reason to suspect that anything on the page is concealed from view.",
];

const COMMENTS = [
  ["Dana", "Bookmarking this for the team walkthrough on Thursday."],
  ["Ives", "Reproduced the same result locally — the seed link is handy."],
  ["Priya", "Would love a printable version of the summary."],
];

function slot(): HTMLElement {
  const span = document.createElement("span");
  span.dataset.slot = "1";
  return span;
}

function para(text: string): HTMLElement {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

/** Build the decoy page and return it with the ordered injection slots. */
export function buildDecoyEnvironment(mode: EnvironmentMode): DecoyEnvironment {
  const root = document.createElement("div");
  root.className = "pg-decoy";
  const slots: HTMLElement[] = [];

  if (mode === "isolated") {
    root.classList.add("pg-decoy--isolated");
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Isolated mode — injected problems only, no surrounding page.";
    root.appendChild(note);
    for (let i = 0; i < 6; i += 1) {
      const s = slot();
      slots.push(s);
      root.appendChild(s);
    }
    return { root, slots };
  }

  // Woven mode: a plausible article with slots interleaved through its structure.
  const header = document.createElement("header");
  header.className = "pg-decoy__header";
  header.innerHTML = `<strong>Field Notes</strong> · <span class="muted">Reproducible Lab Pages</span>`;
  header.appendChild(slot());
  slots.push(header.lastElementChild as HTMLElement);
  root.appendChild(header);

  const article = document.createElement("article");
  article.className = "pg-decoy__article";
  const h = document.createElement("h2");
  h.textContent = "Reproducible pages for detector validation";
  article.appendChild(h);
  ARTICLE_PARAGRAPHS.forEach((text, index) => {
    article.appendChild(para(text));
    const s = slot();
    slots.push(s);
    article.appendChild(s);
    if (index === 1) {
      const pull = document.createElement("blockquote");
      pull.className = "pg-decoy__pull";
      pull.textContent = "The surrounding copy is only camouflage for what the scanner must find.";
      pull.appendChild(slot());
      slots.push(pull.lastElementChild as HTMLElement);
      article.appendChild(pull);
    }
  });
  root.appendChild(article);

  const comments = document.createElement("section");
  comments.className = "pg-decoy__comments";
  const ch = document.createElement("h3");
  ch.textContent = "Comments";
  comments.appendChild(ch);
  COMMENTS.forEach(([author, body]) => {
    const c = document.createElement("div");
    c.className = "pg-decoy__comment";
    c.innerHTML = `<strong></strong> `;
    (c.firstElementChild as HTMLElement).textContent = author!;
    c.append(body!);
    comments.appendChild(c);
  });
  comments.appendChild(slot());
  slots.push(comments.lastElementChild as HTMLElement);
  root.appendChild(comments);

  const footer = document.createElement("footer");
  footer.className = "pg-decoy__footer muted";
  footer.textContent = "Lab fixture — all content is benign filler.";
  root.appendChild(footer);

  return { root, slots };
}
