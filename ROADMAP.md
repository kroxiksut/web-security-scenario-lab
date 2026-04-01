# Roadmap

## Phase 1: Definition

- approve project name and scope
- lock the static-only architecture
- define browser compatibility baseline
- define scenario families for the first two modules
- define placeholder structure for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- define baseline evaluation fields and coverage dimensions

## Phase 2: MVP Lab

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

## Phase 3: Robustness

- add pages with `jQuery`, `React`, and `Vue`
- add `Shadow DOM` and `iframe` coverage
- add browser matrix checks
- add Playwright smoke tests
- publish contribution guidelines for planned modules
- introduce initial coverage matrix views

## Phase 4: Scale-Out

- add manifests for future detector modules and scenario classes
- expand placeholders into real scenario sets for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- extend scenario catalog structure
- extend evaluation metadata taxonomy
- add more locales
- document browser-specific caveats

## Phase 5: Cross-Browser Packaging Support

- reuse the same scenario lab when browser extensions or other security tools are adapted to additional browsers
- keep the lab extension-independent
- use the lab as a regression suite for browser-specific builds
- mature the benchmark-lite layer beyond page demonstration alone
