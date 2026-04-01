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
- module model: implemented modules plus documented placeholder modules marked as planned
- evaluation model: every mature scenario should expose expected outcomes and rationale metadata
- case-registry model: real-world references are stored as Markdown case records mapped to lab scenarios where possible

## Recommended Project Layout

```text
Web Security Scenario Lab/
|
|-- README.md
|-- README.ru.md
|-- package.json
|-- vite.config.js
|-- index.html
|-- pages/
|   |-- visual-manipulation/
|   |   |-- index.html
|   |   |-- hidden-text.html
|   |   |-- hidden-inputs.html
|   |   |-- overlays.html
|   |   `-- style-obfuscation.html
|   |-- link-domain-security/
|   |   |-- index.html
|   |   |-- homographs.html
|   |   |-- visible-mismatch.html
|   |   |-- redirects.html
|   |   `-- unsafe-protocols.html
|   |-- trigger-phrases/
|   |   |-- index.html
|   |   `-- placeholder.html
|   |-- prompt-splitting/
|   |   |-- index.html
|   |   `-- placeholder.html
|   `-- api-interception/
|       |-- index.html
|       `-- placeholder.html
|-- src/
|   |-- app/
|   |-- engine/
|   |-- evaluation/
|   |-- i18n/
|   |-- scenarios/
|   `-- ui/
|-- data/
|   |-- scenarios/
|   |-- evaluation/
|   |-- trigger-phrases/
|   |-- prompt-splitting/
|   `-- api-interception/
|-- assets/
|   |-- backgrounds/
|   |-- images/
|   |-- fonts/
|   `-- libs/
`-- tests/
    `-- playwright/
```

## Navigation Model

- `index.html` is the main landing page.
- The landing page exposes:
  - project summary
  - supported modules
  - language switch
  - browser compatibility note
  - links to scenario groups
  - module status labels such as `mvp` and `planned`
  - a short note explaining that planned modules are extension points, not empty product promises
- Each module page exposes:
  - module overview
  - scenario list or placeholder message
  - static/dynamic toggle where implemented
  - seed input where implemented
  - reroll button where implemented
  - evaluation summary where implemented
  - link back to the landing page
  - contribution note for planned modules

## Module Status Model

Initial documented module set:

- `visual-manipulation` - MVP target
- `link-domain-security` - MVP target
- `trigger-phrases` - planned module, placeholder only
- `prompt-splitting` - planned module, placeholder only
- `api-interception` - planned module, placeholder only

Planned modules should appear in navigation and structure from the beginning so contributors can extend them without changing the information architecture.

## Scenario Engine

The scenario engine should remain simple and deterministic.

- load a scenario manifest from local JSON
- apply a seed-based random generator
- render from preapproved templates only
- mutate content on first load, on manual reroll, or on timed dynamic cycles
- expose scenario metadata in the page UI for easier debugging
- resolve planned modules to safe placeholder states instead of broken routes

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

The following concepts should be treated as part of the target architecture now, even if their full implementation is staged later:

- `why flagged` panel showing which embedded signals exist on the current page
- coverage matrix showing which heuristics are represented by each scenario
- scenario evaluation summary tied to the active seed and variant
- clear separation between intentionally suspicious and intentionally benign pages

This moves the project from a loose page collection toward a benchmark-lite regression lab.

## Library Coverage

The lab should include pages that simulate common frontend environments:

- plain DOM pages
- `jQuery`
- `React`
- `Vue`
- `Shadow DOM`
- `iframe`-based embedding

The purpose is detector robustness, not framework feature parity. Keep each library page minimal and focused on DOM behavior differences.

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

- use cross-platform npm scripts only
- avoid shell-specific scripts for core workflows
- prefer Node-based helpers for generation or validation
- keep all third-party libraries local to the repo when used by scenarios
- avoid runtime dependencies on external CDNs
- keep planned modules documented until real scenarios are added
- design scenario data so evaluation metadata can evolve without changing route structure

## Non-Goals

- no authentication
- no multi-user features
- no persistent user-generated content
- no production backend
- no server-side analytics

