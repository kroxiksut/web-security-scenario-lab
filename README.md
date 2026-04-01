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

## Module Coverage Model

Modules are split into two groups.

Implemented first:

- `visual-manipulation`
- `link-domain-security`

Planned modules with documented placeholder pages from the start:

- `trigger-phrases` - planned module
- `prompt-splitting` - planned module
- `api-interception` - planned module

Planned modules are included to preserve stable information architecture, navigation, and extension points for future work. Their presence should not be interpreted as missing half the product. They are forward-compatible placeholders for future scenario packs.

## Contribution Note

Planned modules should be present in the project structure as documented placeholders. Contributors who want to help may open pull requests with scenario manifests, placeholder-page improvements, evaluation metadata, or full scenario implementations for those modules.

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
- `Vanilla JavaScript` with `ES modules`
- `JSON` manifests for scenario descriptions and evaluation metadata
- `Vite` for local development and static build output
- `Playwright` for local and CI browser checks

`Vite` and `Playwright` are development tools only. They are not required in deployed static hosting.

## High-Level Structure

- `index.html`: main entry page with module cards and scenario catalog.
- `pages/visual-manipulation/`: scenarios for hidden content and CSS obfuscation.
- `pages/link-domain-security/`: scenarios for link mismatch and homograph testing.
- `pages/trigger-phrases/`: planned module placeholder pages.
- `pages/prompt-splitting/`: planned module placeholder pages.
- `pages/api-interception/`: planned module placeholder pages.
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
- Planned modules must still appear in navigation as placeholders with a visible status label.
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
- static and dynamic scenarios for the first two modules
- documented placeholder pages for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- RU and EN UI language switch
- scenario reset and reroll
- scenario metadata panel
- baseline evaluation outputs for implemented scenarios
- browser compatibility baseline
- security-safe static deployment model

## Document Map

- `README.ru.md`: Russian overview
- `ARCHITECTURE.md`: project architecture and directory model
- `ARCHITECTURE.ru.md`: Russian architecture overview
- `BROWSER-COMPATIBILITY.md`: compatibility targets and testing policy
- `SCENARIO-DYNAMICS.md`: randomization, refresh behavior, and scenario mutation rules
- `SCENARIO-DYNAMICS.ru.md`: Russian scenario dynamics overview
- `EVALUATION-OUTPUTS.md`: evaluation artifacts and benchmark-lite model
- `EVALUATION-OUTPUTS.ru.md`: Russian evaluation artifacts overview
- `I18N.md`: language model and future localization expansion
- `SECURITY-DEPLOYMENT.md`: deployment and hardening rules
- `CONTRIBUTING.md`: contribution workflow and expectations
- `DCO.md`: Developer Certificate of Origin requirements
- `MODULES-VISUAL-MANIPULATION.md`: first module test requirements
- `MODULES-VISUAL-MANIPULATION.ru.md`: Russian requirements for the first module
- `MODULES-LINK-DOMAIN-SECURITY.md`: second module test requirements
- `MODULES-LINK-DOMAIN-SECURITY.ru.md`: Russian requirements for the second module
- `ROADMAP.md`: staged delivery plan
- `ROADMAP.ru.md`: Russian roadmap


