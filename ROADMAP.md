# Roadmap

Delivery phases are internal planning vocabulary and live only in this file — documentation is
organized by topic, not by phase. Current state: phases 1–3 complete, phase 4 largely delivered,
phase 5 not started.

## Phase 1: Definition — complete

- approve project name and scope
- lock the static-only architecture
- define browser compatibility baseline
- define scenario families for the first two modules
- define placeholder structure for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- define baseline evaluation fields and coverage dimensions

## Phase 2: MVP Lab — complete

- create landing page
- create module navigation
- implement RU and EN dictionaries
- implement seed-based scenario engine
- implement static and dynamic scenarios for:
  - `visual-manipulation`
  - `link-domain-security`
- implement documented placeholder pages for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- implement baseline evaluation outputs for implemented scenarios
- implement first version of the `why flagged` panel

## Phase 3: Robustness — complete

- add pages with `jQuery`, `React`, and `Vue`
- add `Shadow DOM` and `iframe` coverage
- add browser matrix checks
- adopt the TypeScript scenario engine + Vitest/Ajv/ESLint/Prettier toolchain (engine/infra
  tests only; scenario pages are intentionally not test-covered)
- add optional/manual Playwright E2E against the PageCheck extension (non-gating)
- publish contribution guidelines for planned modules
- introduce initial coverage matrix views

## Phase 4: Scale-Out — largely delivered

Done:

- expanded the placeholder modules into real scenario sets for `trigger-phrases`,
  `prompt-splitting`, and `api-interception`, each with a benign false-positive control
- introduced the benign-scenario contract in the manifest schema (`whyFlagged` / `whyBenign`)
- added the data-driven scenario catalog and the required `page` field on every manifest
- extended the evaluation metadata taxonomy (tags, coverage dimensions, ahead-of-detector notes)
- populated `detectionExamples` in manifests

Remaining:

- render `detectionExamples` next to each scenario in the page UI (the data exists; the view does not)
- the coverage gaps listed under *Planned coverage* in each module document (every module now has at
  least one benign control)
- add more locales
- document browser-specific caveats

## Phase 5: Cross-Browser Packaging Support — not started

- reuse the same scenario lab when browser extensions or other security tools are adapted to additional browsers
- keep the lab extension-independent
- use the lab as a regression suite for browser-specific builds
- mature the benchmark-lite layer beyond page demonstration alone
