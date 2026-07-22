# Architecture

## Goal

Build a static browser-security scenario lab for browser-extension QA, regression testing, controlled security research demos, and red/blue/purple team validation without introducing backend complexity or server attack surface.

## Positioning Model

The lab should be designed as a detector validation environment first.

- primary use case: validating browser-extension detectors against deceptive or hidden webpage behaviors
- secondary use case: reproducible security research demos in controlled environments
- design intent: benchmark-lite validation rather than general-purpose security simulation
- differentiation: not a phishing platform, not a crawler, not a reputation service

## Architectural Model

- delivery model: static hosting only
- runtime model: client-side only
- dev model: local-first, cross-platform
- browser model: standards-first, extension-independent
- data model: scenario manifests plus seeded runtime mutation
- module model: every detection module ships real scenarios; adding one must not change the information architecture
- evaluation model: every mature scenario should expose expected outcomes and rationale metadata
- case-registry model: real-world references are stored as Markdown case records mapped to lab scenarios where possible

## Project Layout

Current tree (directories that exist today; `node_modules/` and build output omitted).

```text
Web Security Scenario Lab/
|
|-- README.md / README.ru.md
|-- package.json
|-- vite.config.ts            # rollup inputs: one entry per scenario page
|-- serve.mjs                 # zero-dependency static server for dist/
|-- index.html                # landing page
|-- pages/
|   |-- visual-manipulation/  # index.html, hidden-text.html, shadow-dom.html, iframe.html
|   |-- link-domain-security/ # index.html, homographs.html
|   |-- trigger-phrases/      # index.html, mixed.html, unicode.html, benign.html
|   |-- prompt-splitting/     # index.html, spaced/compact/benign, attribute-chain/attribute-benign
|   |-- api-interception/     # index.html, endpoints/benign, mime-signature/mime-benign
|   |-- scenarios/            # data-driven catalog of every scenario
|   |-- frameworks/           # framework/version coverage matrix
|   `-- settings/
|-- frameworks/<lib>/<vN>/    # same scenario reproduced on a pinned framework version
|-- src/
|   |-- engine/               # manifest + matrix schemas, validators, seeded PRNG, evaluation resolver
|   |-- shell/                # header/nav/sidepanel injector, theme, language, focus mode, seed controls
|   |-- pages/                # per-page controllers (scenario, scenarios, frameworks, settings)
|   |-- scenarios/            # scenario behavior, typed TS, one file per scenario id
|   |   `-- _shared/          # shared drivers + corpora (outside the scenario glob)
|   |-- i18n/                 # locales/en.json, locales/ru.json, translator
|   `-- styles/               # base + components + per-module stylesheets
|-- data/
|   |-- scenarios/            # one JSON manifest per scenario (the ground truth)
|   |-- evaluation/           # reserved for shared evaluation data
|   `-- frameworks.json       # library -> versions -> {alias, releaseDate, whyIncluded, scenarios}
|-- public/lab-fragments/     # static fragments fetched by scenarios (htmx swap)
|-- cases/                    # Markdown case registry, per module + cross-module
|-- docs/                     # en/ + ru/ documentation pairs
|-- scripts/                  # setup.mjs (cross-platform) + thin .ps1/.sh wrappers
|-- assets/
`-- tests/unit/               # Vitest: engine and infrastructure only
```

## Navigation Model

- `index.html` is the main landing page.
- The landing page exposes:
  - project summary
  - module cards grouped by what the manipulation targets (the human reader / an AI agent reading the page)
  - cards for the cross-module views: scenario catalog and framework coverage matrix
  - language switch
  - links to scenario groups
- The shell (`src/shell/mountShell.ts`) injects the header, module nav, sidepanel, and footer around
  each page's own content, so a scenario page ships only its own DOM. Navigation carries no module
  status labels: every module has real scenarios.
- Each module page exposes:
  - module overview
  - scenario list linking to its pages
  - link back to the landing page
- Each scenario page exposes:
  - seed input, reroll, reset, and copy-deep-link controls
  - an evaluation sidepanel rendered from the scenario's manifest
  - focus mode (`?focus=1`) that strips the shell down to the scenario DOM alone

## Module Status Model

Detection modules, mapping 1:1 to the detector's modules. All five ship real scenarios.

Aimed at the human reader:

- `visual-manipulation` — 22 scenarios (3 core pages, a benign control, and 18 framework/version variants)
- `link-domain-security` — 2 scenarios

Aimed at an AI agent reading the page:

- `trigger-phrases` — 3 scenarios
- `prompt-splitting` — 5 scenarios
- `api-interception` — 4 scenarios

**Benign-scenario contract:** every module ships both positive scenarios (`shouldFire: true`,
requiring `whyFlagged`) and at least one benign false-positive control (`shouldFire: false`, requiring
`whyBenign`). The manifest schema enforces which rationale is required. Across the lab that is 29
positive scenarios and 7 benign controls. A benign control is written to trip a *naive* version of
its own module's heuristic, so the pair defines the decision boundary rather than only the positive
side of it.

Adding a module, scenario, or framework version must not require changing the information
architecture.

## Scenario Engine

The scenario engine remains simple and deterministic.

- a page declares its identity through body data attributes (`data-scenario`, `data-module`,
  `data-root`); the engine loads the matching manifest and behavior module by id
- manifests are local JSON, validated against a JSON Schema (Ajv) at test/build time
- scenario behavior is typed TypeScript under `src/scenarios/<id>.ts`, exporting `run(ctx)` with a
  seeded `rng` and a `root` element; shared drivers live in `src/scenarios/_shared/`
- randomness comes from a seeded PRNG (mulberry32) resolved from `?seed=`, never `Math.random`
- content is rendered from internal templates only, never from user input
- content mutates on first load, on manual reroll (a new seed), and on timed or interactive
  in-page cycles
- scenario metadata is rendered into the evaluation sidepanel from the manifest, so the page UI and
  the ground truth cannot drift apart

## Evaluation Layer

The lab should not stop at page generation. It should also describe how a detector is expected to behave.

Each mature scenario should be able to publish:

- expected signal
- detector should fire or should not fire
- severity
- tags
- explanation of why the page is suspicious or intentionally benign
- coverage dimensions such as hidden text, tiny font, off-screen placement, z-index masking, misleading anchor text, punycode or mixed-script patterns, and protocol abuse

## Benchmark-Lite UI

These are what move the project from a loose page collection toward a benchmark-lite regression lab.
Shipped:

- `why flagged` / `why benign` sidepanel rendered from the active scenario's manifest
- scenario catalog listing every scenario by module with expected signal, verdict, severity, and tags
- framework coverage matrix generated from `data/frameworks.json`
- scenario evaluation summary tied to the active seed and variant
- explicit separation between intentionally suspicious and intentionally benign pages

Still target-state:

- rendering `detectionExamples` next to the scenario as teaching material (the manifest field is
  reserved and populated; runtime rendering is deferred)
- a coverage view keyed by heuristic/coverage dimension rather than by module or framework
- a machine-readable export of the ground truth for automated detector scoring

## Library Coverage

The lab should include pages that simulate common frontend environments:

- plain DOM pages
- `jQuery`
- `React`
- `Vue`
- `Svelte`
- `Angular`
- `Solid`
- `Preact`
- `Lit` / Web Components
- `htmx`, `Alpine`
- `Tailwind` (utility-class CSS obfuscation surface)
- `Shadow DOM`
- `iframe`-based embedding

The purpose is detector robustness, not framework feature parity. Keep each library page minimal and focused on DOM behavior differences.

**The library/framework set is intentionally open-ended and may be expanded over time** as the
real-world web evolves; adding a library must not require changing the information architecture.
Version policy: latest stable patch, framework major `>= 2022`, with deliberate
legacy-but-ubiquitous exceptions (e.g. jQuery 3.7.x) since the detector must also handle old
pages. All libraries are vendored/pinned locally — no runtime CDN.

### Multi-version coverage

Library **version is itself a coverage dimension**: different majors emit different DOM/runtime
signatures (event delegation, hydration markers, framework attributes) that the detector must
survive. Multiple versions coexist via **npm aliases** (`react18@npm:react@18`,
`react19@npm:react@19`), one version per scenario page, organized in versioned folders
(`frameworks/react/v18/`) and described in a `data/frameworks.json` matrix
(library → versions → `{alias, releaseDate, whyIncluded}`). Versions are exact-pinned and
deliberately not auto-updated — legacy coverage is the point. The matrix is expandable on two
axes (new libraries and new versions). It is not built exhaustively at once: representative
majors first (React, Vue, jQuery), widened later.

## Language & Tooling

- Scenario **engine and shared infrastructure** are written in `TypeScript` where it improves
  safety and maintainability (seeded PRNG, manifest loader/validator, i18n, evaluation resolver).
- **Scenario markup and runtime DOM stay intentionally messy** — imperfect HTML, odd events, and
  timed mutations mirror real malicious pages and must not be "cleaned up". The *behavior* driving
  them is nevertheless authored as typed TypeScript under `src/scenarios/`, which keeps authoring
  maintainable without making the resulting DOM any tidier.
- **Engine dependency policy: aim for zero runtime dependencies.** The shell, i18n, routing, seeded
  PRNG, and settings are hand-written over the DOM API; no UI framework is used by the engine, so
  scenario pages stay a neutral DOM for the detector under test. `Ajv` is the one sanctioned library,
  and it runs at build/test time rather than shipping to the runtime.
- Build/test tooling: `Vite` (build), `Vitest` (engine unit tests), `Ajv` (manifest schema
  validation), `ESLint` + `Prettier`. `Playwright` is optional/manual for extension E2E only.
- Node.js `^20.19` / `^22.12` / `>=24` is required by the toolchain; see
  [`docs/en/getting-started.md`](./docs/en/getting-started.md).

## Dynamic Page Support

Dynamic pages are in scope and should be included in the specification.

- delayed DOM insertion
- periodic content replacement
- attribute mutation
- class name mutation
- link target regeneration
- background and contrast changes
- overlay timing changes

These changes must happen in-browser only.

## Development Rules

- use cross-platform npm scripts only (`npm run setup`, `npm run verify`, …)
- avoid shell-specific scripts for core workflows: `scripts/setup.ps1` and `scripts/setup.sh` are
  convenience entry points that forward to `scripts/setup.mjs` and hold no logic of their own, so the
  two systems cannot drift apart
- prefer Node-based helpers for generation or validation
- keep all third-party libraries local to the repo when used by scenarios
- avoid runtime dependencies on external CDNs
- test the engine and infrastructure only; scenario pages are deliberately variable and stay uncovered
- design scenario data so evaluation metadata can evolve without changing route structure
- document current behavior separately from target behavior, and keep `docs/en` and `docs/ru` in sync

## Non-Goals

- no authentication
- no multi-user features
- no persistent user-generated content
- no production backend
- no server-side analytics

