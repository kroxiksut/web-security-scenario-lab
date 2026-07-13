import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import angular from "@analogjs/vite-plugin-angular";

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
  // Compiler-plugin frameworks. vite-plugin-solid transforms the Solid `.tsx` component; the Svelte
  // plugin transforms `.svelte` files. Each only touches its own file type, so pages that import
  // neither are unaffected, and each framework code-splits into its own chunk (never entering the
  // neutral shell). Non-JSX `.ts` scenarios (e.g. React via createElement) carry no JSX, so Solid's
  // JSX transform does not affect them.
  //
  // @tailwindcss/vite only activates on CSS that imports Tailwind; the Tailwind scenario's CSS is
  // imported solely by its own `.ts`, so the generated utilities code-split into that scenario's
  // chunk and never enter the shell (main.css imports no Tailwind).
  // Angular (AOT via @analogjs/vite-plugin-angular). Unlike Svelte/Solid, Angular has no dedicated
  // file extension, so the plugin is doubly scoped to the Angular slice only: a dedicated
  // `tsconfig.angular.json` bounds its compilation program to the one Angular component file, and
  // `transformFilter` restricts the Angular transform to the component only (not the plain-TS driver,
  // whose exports the AOT emit would otherwise drop) — so no other scenario `.ts` is Angular-compiled
  // and the neutral shell stays Angular-free. `angular()` returns an array of plugins, hence the spread.
  plugins: [
    solid(),
    svelte(),
    tailwindcss(),
    ...angular({
      tsconfig: "tsconfig.angular.json",
      transformFilter: (_code, id) => id.includes("angularHiddenText.component"),
    }),
  ],
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
        "frameworks-preact-v10-hidden-text": page("frameworks/preact/v10/hidden-text.html"),
        "frameworks-lit-v3-hidden-text": page("frameworks/lit/v3/hidden-text.html"),
        "frameworks-lit-v2-hidden-text": page("frameworks/lit/v2/hidden-text.html"),
        "frameworks-alpine-v3-hidden-text": page("frameworks/alpine/v3/hidden-text.html"),
        "frameworks-alpine-v2-hidden-text": page("frameworks/alpine/v2/hidden-text.html"),
        "frameworks-htmx-v2-hidden-text": page("frameworks/htmx/v2/hidden-text.html"),
        "frameworks-htmx-v1-hidden-text": page("frameworks/htmx/v1/hidden-text.html"),
        "frameworks-svelte-v5-hidden-text": page("frameworks/svelte/v5/hidden-text.html"),
        "frameworks-solid-v1-hidden-text": page("frameworks/solid/v1/hidden-text.html"),
        "frameworks-tailwind-v4-hidden-text": page("frameworks/tailwind/v4/hidden-text.html"),
        "frameworks-angular-v22-hidden-text": page("frameworks/angular/v22/hidden-text.html"),
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
