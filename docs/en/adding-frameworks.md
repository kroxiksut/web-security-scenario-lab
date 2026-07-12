# Adding a Framework or Version (Phase 3)

Russian mirror: [`../ru/adding-frameworks.md`](../ru/adding-frameworks.md).

Framework pages reproduce a scenario through a specific UI runtime (jQuery, React, Vue, …) so the
PageCheck detector is exercised against framework-authored DOM, not only hand-written markup.
**Library version is a coverage dimension:** each major emits a different DOM/runtime signature, so
the same scenario is hosted on several pinned versions.

## Hard rules

- **Bundle locally — never a runtime CDN.** The library is a build-time dependency; the runtime
  needs no network.
- **Exact pins, no `^`/`~`.** Stale/legacy versions are deliberate and must not auto-update.
- **One framework major per page.** Never load two majors of the same library on one page.
- **Scenario pages are not unit-tested.** Only the engine/matrix infrastructure is (see
  `AGENTS.md`). The matrix (`data/frameworks.json`) *is* validated.
- **No real brands or live domains** in scenario content (RFC 2606 reserved names only).

## Choose an install strategy

| Library shape | Strategy | Example |
| --- | --- | --- |
| Self-contained (no cross-package imports) | **Root npm alias** | jQuery, Vue: `jquery1@npm:jquery@1.12.4`, `vue2@npm:vue@2.7.16` |
| Couples to a sibling package at runtime | **Nested `node_modules`** under `frameworks/<lib>/<vN>/` + Vite alias | React: `react-dom` internally imports bare `react` |

The React case fails with a plain root alias because `react-dom`'s internal `import "react"` would
bind the wrong version. A nested install co-locates each `react-dom` with its matching `react`, and
a Vite `resolve.alias` points the import specifier at that nested path; because the aliased
`react-dom` physically sits next to its `react`, its own bare import resolves (by file location) to
the co-located version.

## Add a new VERSION of an existing framework

1. **Install the pin.**
   - Self-contained: `npm install --save-exact "<alias>@npm:<pkg>@<version>"`.
   - Nested (React): add `frameworks/<lib>/<vN>/package.json` with exact `dependencies`, add the
     folder to the `frameworks:install` script, run `npm run frameworks:install`, and add a
     `resolve.alias` entry in `vite.config.ts` pointing at the nested `node_modules`. Nested
     `node_modules` are gitignored; the pin `package.json` is committed.
2. **Types for aliases** (only if the specifier has no bundled types): add a `declare module`
   re-export in `src/frameworks.d.ts`. Aliases resolving to a package with its own types
   (e.g. `vue2`) need nothing.
3. **Behavior** — add `src/scenarios/<id>.ts` exporting `run(ctx)`. Import the framework via its
   alias/specifier and delegate to the shared driver in `src/scenarios/_shared/`. Reuse an existing
   driver when the render model matches; add a mount/adaptor branch when the API differs
   (e.g. React 17 `ReactDOM.render` vs 18/19 `createRoot`; Vue 2 `new Vue().$mount` vs 3 `createApp`).
4. **Page** — add `frameworks/<lib>/<folder>/hidden-text.html`. Copy an existing version's page;
   set `data-scenario="<id>"`, `data-module`, and `data-root="../../.."`.
5. **Manifest** — add `data/scenarios/<id>.json` (same evaluation ground truth; tag the framework
   and version, e.g. `framework:react`, `legacy-version`).
6. **Vite input** — register the page in `rollupOptions.input` in `vite.config.ts`.
7. **Matrix** — add a version entry under the framework in `data/frameworks.json`:
   `{version, major, folder, alias, releaseDate, whyIncluded (en+ru), scenarios: [{id, page}]}`.
8. **Discoverability** — the coverage view (`pages/frameworks/index.html`) lists it automatically
   from the matrix. Optionally add a card on the module catalog page.

## Add a NEW framework

Same as above, plus:

- Add a new top-level entry to `data/frameworks.json` (`id`, `name`, `kind`, `versions`).
- Add a new shared driver in `src/scenarios/_shared/` if no existing render model fits.
- Set any required build flags in `vite.config.ts` (e.g. Vue's `__VUE_OPTIONS_API__` defines when
  used without `@vitejs/plugin-vue`).

## Verify (all must pass)

```
npm run typecheck && npm run lint && npm run test && npm run build
```

Then confirm in the build output that the framework lands in **its own code-split chunk** and does
**not** appear in the shared `main` chunk, and open the page (`npm run dev`) to see the scenario
render. For nested-install frameworks, run `npm run frameworks:install` first on a fresh clone.
