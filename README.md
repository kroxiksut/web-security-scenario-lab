# Web Security Scenario Lab

Static QA and regression lab for browser-extension detectors, defensive rendering analysis, and controlled security research demos.

> [!CAUTION]
> This project is strictly educational and research-oriented. It demonstrates possible attacker techniques and suspicious web-page patterns for defensive analysis, security tooling validation, and detector testing.
> 
> The project is not intended for operational abuse, phishing, fraud, or malicious deployment. Scenario content may include randomly generated links, deceptive-looking labels, visual obfuscation patterns, and other simulated attack vectors.
> 
> Users and operators are solely responsible for how the project is used. The project authors and maintainers do not accept liability for any damage, loss, or negative consequences caused by user actions, including but not limited to following randomly generated links, interacting with deceptive demo content, or reusing the materials outside a controlled security testing context.
> 
> All deployments and local runs should be treated as controlled security research environments.

## Positioning

Web Security Scenario Lab is a separate local-first project used to generate reproducible client-side webpage scenarios for validating browser detectors and browser-adjacent security tooling.

Primary focus areas:

- browser-extension QA
- regression testing
- security research demos
- red team validation in controlled environments
- blue team validation in controlled environments
- purple team validation in controlled environments

Unlike phishing simulation platforms or end-user awareness demos, this lab focuses on reproducible client-side webpage patterns for validating browser detectors against hidden or deceptive rendering techniques.

## What This Is Not

This project is not:

- a phishing campaign platform
- a user-awareness LMS or employee training portal
- an end-user awareness demo suite for nontechnical audiences
- a URL reputation service
- a crawler-based internet scanner
- a live web collection or scraping system
- a domain reputation or threat intelligence feed
- a browser automation farm for mass internet probing
- a replacement for real-world threat intel, SOC telemetry, or production blocklists

## Quick Start

Requires Node.js `^20.19` / `^22.12` / `>=24` (Vite 8). These four commands are identical on Windows
(PowerShell) and Linux (bash):

```bash
npm run setup                # preflight checks + both installs (once, on a fresh clone)
npm run dev                  # http://localhost:5173/
npm run build                # static output in dist/, ready for any file server
npm run verify               # typecheck + lint + test + build
```

Serve `dist/`, not the repository root — source pages reference `src/main.ts`, which only a bundler
can resolve. `npm run preview` or `node serve.mjs dist` will do it.

**Step-by-step walkthroughs, separately for each system** — which terminal to open, where to `cd`,
what to run, how to serve the build, plus the deep-link parameters (`?seed=`, `?focus=1`, `?lang=`,
`?theme=`): **[docs/en/getting-started.md](./docs/en/getting-started.md)**
(Russian: [docs/ru/getting-started.md](./docs/ru/getting-started.md)).

## Module Coverage Model

Modules map 1:1 to the detector's modules and split by what the manipulation targets.

Aimed at the human reader:

- `visual-manipulation` — content present in the DOM but suppressed from view (22 scenarios)
- `link-domain-security` — links whose visible and actual target disagree (2 scenarios)

Aimed at an AI agent reading the page:

- `trigger-phrases` — prompt-injection-style instructions in text and attributes (3 scenarios)
- `prompt-splitting` — one instruction fragmented across DOM nodes or attributes (5 scenarios)
- `api-interception` — API-shaped attribute markers, and declared MIME vs first-byte signature (4 scenarios)

All five modules ship real scenarios; none is a placeholder. Every module carries both positive
scenarios and at least one benign false-positive control — 36 scenarios in total, 29 positive and 7
benign. See
[docs/en/README.md](./docs/en/README.md) for what each module covers, and each module document for its
scenario table and remaining coverage gaps.

## Contribution Note

Contributors may open pull requests with new scenario manifests, additional coverage axes for an
existing module, evaluation metadata, or framework/version widening. Each module document lists its
**Planned coverage** — the concrete families and benign controls not yet built — which is the easiest
place to start.

## Core Requirements

- Static delivery only: HTML, CSS, JavaScript, JSON, assets.
- No backend, no database, no server-side rendering, no user sessions.
- Works locally on Windows and Linux.
- Works in modern browsers: Chrome, Edge, Firefox, Safari, Chromium-based browsers.
- Supports RU and EN from the first iteration.
- Provides a main landing page with navigation to module-specific pages.
- Produces dynamic scenario variations on page load and on demand.
- Keeps server load near zero because all runtime logic executes in the browser.
- Avoids server-side attack surface by not shipping executable server logic.
- Treats scenarios as benchmark-lite assets for detector validation, not just demo pages.

## Recommended Stack

- `HTML5`
- `CSS3`
- `Vanilla JavaScript` with `ES modules`; `TypeScript` for the scenario engine and shared
  infrastructure where it improves safety and maintainability
- `JSON` manifests for scenario descriptions and evaluation metadata
- `Vite` for local development and static build output
- `Playwright` for local and CI browser checks

`Vite` and `Playwright` are development tools only. They are not required in deployed static hosting.

Scenario pages may embed popular web frameworks/libraries (React, Vue, Svelte, Angular, Solid,
Preact, Lit/Web Components, jQuery, htmx, Alpine, Tailwind, …). **This set is not fixed and may
be expanded over time** to keep detector coverage aligned with the real-world web. All such
libraries are vendored/pinned locally — no runtime CDN dependency.

## High-Level Structure

- `index.html`: main entry page with module cards and scenario catalog.
- `pages/visual-manipulation/`: scenarios for hidden content and CSS obfuscation.
- `pages/link-domain-security/`: scenarios for link mismatch and homograph testing.
- `pages/trigger-phrases/`: scenarios for prompt-injection-style instructions.
- `pages/prompt-splitting/`: scenarios for instructions fragmented across the DOM.
- `pages/api-interception/`: scenarios for API-shaped attributes and MIME/signature mismatch.
- `pages/scenarios/`: data-driven catalog of every scenario, grouped by module.
- `pages/frameworks/`: framework/version coverage matrix.
- `frameworks/<lib>/<vN>/`: the same scenario reproduced on a pinned framework version.
- `pages/shared/`: shared layouts and generic demo helpers.
- `assets/`: fonts, local JS libraries, images, background samples.
- `data/scenarios/`: JSON manifests and randomized configuration sets.
- `data/evaluation/`: expected outcomes, tags, severity, and rationale metadata.
- `src/`: scenario engine, i18n, seeded random generator, evaluation layer, page bootstrap, and benchmark-lite UI.

## Functional Principles

- Each scenario page can work in two modes: fixed and randomized.
- Randomization must be reproducible through `seed`.
- Query parameters should allow direct deep links, for example:
  - `?lang=ru`
  - `?seed=1042`
  - `?module=visual-manipulation`
  - `?scenario=hidden-text-mixed`
- Dynamic content changes must happen in the browser only.
- Suspicious content must be generated from internal templates, not from user input.
- Adding a module, scenario, or framework version must not require an information-architecture change.
- Scenarios should expose evaluation outputs instead of only visual variation.

## Evaluation Outputs

Every mature scenario should be able to expose researcher-facing artifacts such as:

- expected signal
- detector should fire / should not fire
- severity
- tags
- explanation of why the page is suspicious or intentionally benign
- coverage dimensions used in the scenario

The long-term goal is to make the lab benchmark-lite rather than a loose collection of pages. A `why flagged` panel and a coverage matrix should therefore be treated as first-class parts of the product architecture.

## Scope of the First Release

- landing page and module navigation
- static and dynamic scenarios for all five modules
- scenario catalog and framework coverage matrix generated from the manifests
- RU and EN UI language switch
- scenario reset and reroll
- scenario metadata panel
- baseline evaluation outputs for implemented scenarios
- browser compatibility baseline
- security-safe static deployment model

## Document Map

Full documentation lives in [`docs/`](./docs/README.md), split by language and organized by topic —
start from [`docs/en/index.md`](./docs/en/index.md) or [`docs/ru/index.md`](./docs/ru/index.md).

In `docs/` (each with a Russian mirror under `docs/ru/`):

- [`getting-started.md`](./docs/en/getting-started.md): running the lab on Windows or Linux
- [`README.md`](./docs/en/README.md): detection-module overview
- `visual-manipulation.md`, `link-domain-security.md`, `trigger-phrases.md`, `prompt-splitting.md`,
  `api-interception.md`: one document per detection module
- [`adding-frameworks.md`](./docs/en/adding-frameworks.md): adding a framework or a pinned version

Still in the repository root (migrating into `docs/` incrementally):

- `README.ru.md`: Russian overview
- `ARCHITECTURE.md` / `ARCHITECTURE.ru.md`: project architecture and directory model
- `BROWSER-COMPATIBILITY.md`: compatibility targets and testing policy
- `SCENARIO-DYNAMICS.md` / `SCENARIO-DYNAMICS.ru.md`: randomization, refresh behavior, mutation rules
- `EVALUATION-OUTPUTS.md` / `EVALUATION-OUTPUTS.ru.md`: evaluation artifacts and benchmark-lite model
- `I18N.md`: language model and future localization expansion
- `SECURITY-DEPLOYMENT.md`: deployment and hardening rules
- `CONTRIBUTING.md`: contribution workflow and expectations
- `DCO.md`: Developer Certificate of Origin requirements
- `ROADMAP.md` / `ROADMAP.ru.md`: staged delivery plan


