import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));
const page = (p: string): string => fileURLToPath(new URL(p, import.meta.url));
const dir = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// Static, client-side-only lab. `base: "./"` keeps built asset paths relative so the
// output in `dist/` can be served from any static server (or even opened from file://
// as an optional bonus).
//
// Multi-page build: every HTML page is a Rollup input. All pages now use the module entry
// (`src/main.ts`); the legacy `src/app.js` has been removed.
export default defineConfig({
  root,
  base: "./",
  // Vue is used via render functions only (no SFCs, no @vitejs/plugin-vue). The esm-bundler build
  // references these compile-time feature flags; define them here so the plugin-less setup builds
  // clean with no runtime warnings. Harmless for pages that don't import Vue (dead-code eliminated).
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  resolve: {
    // Multi-version React. Each aliased specifier points at a version-isolated nested install
    // (frameworks/react/vNN/node_modules). The KEY trick: because each react-dom physically sits
    // next to its matching react, react-dom's internal bare `import "react"` resolves (by file
    // location) to the co-located react — so v17's react-dom binds react 17, v19's binds react 19,
    // independent of the root `react` (18). One React major per page; never two on one page.
    alias: {
      react17: dir("frameworks/react/v17/node_modules/react"),
      "react-dom17": dir("frameworks/react/v17/node_modules/react-dom"),
      react19: dir("frameworks/react/v19/node_modules/react"),
      "react-dom19": dir("frameworks/react/v19/node_modules/react-dom"),
    },
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: page("index.html"),
        settings: page("pages/settings/index.html"),
        frameworks: page("pages/frameworks/index.html"),
        "visual-manipulation": page("pages/visual-manipulation/index.html"),
        "visual-manipulation-hidden-text": page("pages/visual-manipulation/hidden-text.html"),
        "visual-manipulation-shadow-dom": page("pages/visual-manipulation/shadow-dom.html"),
        "visual-manipulation-iframe": page("pages/visual-manipulation/iframe.html"),
        "link-domain-security": page("pages/link-domain-security/index.html"),
        "link-domain-security-homographs": page("pages/link-domain-security/homographs.html"),
        "trigger-phrases": page("pages/trigger-phrases/index.html"),
        "prompt-splitting": page("pages/prompt-splitting/index.html"),
        "api-interception": page("pages/api-interception/index.html"),
        // Framework robustness pages (Phase 3). Versioned folders under frameworks/<lib>/<vN>/;
        // the framework is bundled locally into this page's chunk (no runtime CDN).
        "frameworks-jquery-v3-hidden-text": page("frameworks/jquery/v3/hidden-text.html"),
        "frameworks-jquery-v1-hidden-text": page("frameworks/jquery/v1/hidden-text.html"),
        "frameworks-react-v17-hidden-text": page("frameworks/react/v17/hidden-text.html"),
        "frameworks-react-v18-hidden-text": page("frameworks/react/v18/hidden-text.html"),
        "frameworks-react-v19-hidden-text": page("frameworks/react/v19/hidden-text.html"),
        "frameworks-vue-v3-hidden-text": page("frameworks/vue/v3/hidden-text.html"),
        "frameworks-vue-v2-hidden-text": page("frameworks/vue/v2/hidden-text.html"),
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
