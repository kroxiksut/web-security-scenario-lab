import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Page-shell consistency. Every page ships only its own content and lets `src/main.ts` build the
 * header/nav/side panel/footer around it at runtime — which means the raw content is in the document
 * before the shell exists. Without the inline guard in `<head>`, navigation flashes unstyled markup
 * on every page load. The guard is inline (not in main.css) because in dev the stylesheet itself
 * arrives via JavaScript, far too late to prevent the flash.
 */
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

function htmlFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".git", "dist", "public"].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) htmlFiles(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const pages = htmlFiles(repoRoot)
  .map((file) => ({ path: relative(repoRoot, file), text: readFileSync(file, "utf8") }))
  .filter((page) => page.text.includes("data-shell-main"));

describe("page shell", () => {
  it("finds the lab's pages", () => {
    expect(pages.length).toBeGreaterThan(20);
  });

  it("hides page content until the runtime shell is mounted", () => {
    const missing = pages
      .filter(
        (page) =>
          !/\[data-shell-main\],\s*\[data-shell-sidepanel\]\s*\{\s*visibility:\s*hidden/.test(
            page.text,
          ),
      )
      .map((page) => page.path);
    expect(missing, "pages without the anti-flash guard in <head>").toEqual([]);
  });

  it("keeps a noscript fallback so content is never permanently hidden", () => {
    const missing = pages
      .filter(
        (page) => !/<noscript>[\s\S]*?visibility:\s*visible[\s\S]*?<\/noscript>/.test(page.text),
      )
      .map((page) => page.path);
    expect(missing, "pages whose guard has no <noscript> escape").toEqual([]);
  });

  it("boots every page through the single entry point", () => {
    const missing = pages
      .filter((page) => !page.text.includes("src/main.ts"))
      .map((page) => page.path);
    expect(missing, "pages that do not load src/main.ts").toEqual([]);
  });
});
