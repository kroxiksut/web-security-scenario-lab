import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));
const page = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// Static, client-side-only lab. `base: "./"` keeps built asset paths relative so the
// output in `dist/` can be served from any static server (or even opened from file://
// as an optional bonus).
//
// Multi-page build: every HTML page is a Rollup input. All pages now use the module entry
// (`src/main.ts`); the legacy `src/app.js` has been removed.
export default defineConfig({
  root,
  base: "./",
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: page("index.html"),
        settings: page("pages/settings/index.html"),
        "visual-manipulation": page("pages/visual-manipulation/index.html"),
        "visual-manipulation-hidden-text": page("pages/visual-manipulation/hidden-text.html"),
        "link-domain-security": page("pages/link-domain-security/index.html"),
        "link-domain-security-homographs": page("pages/link-domain-security/homographs.html"),
        "trigger-phrases": page("pages/trigger-phrases/index.html"),
        "prompt-splitting": page("pages/prompt-splitting/index.html"),
        "api-interception": page("pages/api-interception/index.html"),
      },
    },
  },
  test: {
    // Engine/infrastructure tests only. Scenario pages are intentionally variable and
    // are never test-covered (see AGENTS.md testing policy).
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
