import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Build-tooling guard against a silent, dev-only breakage.
 *
 * `@analogjs/vite-plugin-angular` resolves `oxc: config.oxc ?? false` in its config hook, and
 * `oxc: false` switches OFF Vite's built-in TypeScript transform for EVERY file, not just Angular
 * ones. Combined with our `transformFilter` — which correctly keeps the Angular transform away from
 * non-Angular files — that leaves nothing to strip types in dev: the dev server serves raw TS and
 * every page dies on `SyntaxError: Unexpected token ':'` (no styles, no shell). The build path is
 * unaffected, so `npm run build` stays green while the whole lab is broken under `npm run dev`.
 *
 * The config cannot be imported here: the Angular plugin calls Node's `registerHooks`, which Vitest
 * blocks. So this asserts on the config source instead — enough to catch the line being dropped.
 */
const source = readFileSync(
  fileURLToPath(new URL("../../vite.config.ts", import.meta.url)),
  "utf8",
);

describe("vite config", () => {
  it("keeps Vite's TypeScript transform enabled (oxc must be set, and never false)", () => {
    const oxc = source.match(/^\s*oxc:\s*(.+?),?\s*$/m);
    expect(
      oxc,
      "vite.config.ts must set `oxc` explicitly — see the comment above it",
    ).not.toBeNull();
    expect(oxc?.[1]).not.toMatch(/^false\b/);
  });

  it("scopes the Angular transform to the Angular component only", () => {
    // Widening this filter to every .ts file makes the Angular AOT emit drop the exports of plain-TS
    // scenarios; removing it compiles the whole lab through Angular. Both are regressions.
    expect(source).toMatch(/transformFilter:\s*\(_code,\s*id\)\s*=>\s*id\.includes\(/);
    expect(source).toMatch(/tsconfig:\s*"tsconfig\.angular\.json"/);
  });
});
