# Contributing

Thank you for considering a contribution to Web Security Scenario Lab.

This repository is intended to be published under the Apache License 2.0. Unless explicitly stated otherwise, submitted contributions are expected to be offered under the same license terms as the repository.

All contributors must follow the Developer Certificate of Origin process described in [`DCO.md`](DCO.md).

## Contribution Priorities

Start with [`docs/en/getting-started.md`](docs/en/getting-started.md) to run the lab, and
[`docs/en/README.md`](docs/en/README.md) for what each detection module covers.

Contributions are especially welcome in the following areas:

- new reproducible browser-side scenarios
- regression-oriented scenario improvements
- **benign false-positive controls** — scenarios where the detector must stay silent
- the concrete gaps listed under *Planned coverage* in each module document, for example the missing
  benign controls for `visual-manipulation` and `link-domain-security`
- evaluation metadata and expected outcome definitions
- new framework libraries or pinned versions (see
  [`docs/en/adding-frameworks.md`](docs/en/adding-frameworks.md))
- coverage-matrix improvements
- benchmark-lite UI improvements such as `why flagged` and signal panels
- case records under `cases/` mapping real-world observations to lab scenarios
- cross-browser behavior validation
- documentation clarifications, in mirrored `docs/en` + `docs/ru` pairs

## What Good Contributions Look Like

A good contribution is:

- reproducible
- local-first
- static-hosting friendly
- safe for controlled research environments
- understandable by reviewers
- aligned with browser-extension QA and detector validation goals

## Before You Start

Please make sure your change:

- does not require a backend
- does not add external runtime dependencies that require live services
- does not turn the project into a phishing delivery platform, crawler, reputation feed, or awareness LMS
- does not rely on uncontrolled third-party content
- does not introduce unnecessary server load
- keeps scenario behavior reproducible when a seed is provided
- keeps evaluation metadata in sync with the scenario behavior

## Scenario Contribution Rules

When adding or modifying scenarios:

- prefer deterministic scenario manifests and seed-based variation
- document whether the detector should fire or should not fire
- include severity, tags, and rationale where applicable — the schema requires `whyFlagged` for a
  positive scenario and `whyBenign` for a benign one
- keep malicious-looking behavior simulated and controlled
- avoid live internet dependencies when a local equivalent can be used
- avoid hidden behavior that reviewers cannot understand from the diff
- keep dynamic mutations tied to expected evaluation outputs
- use only RFC 2606 reserved names (`.example`, `.invalid`, `.test`) — no real brands, and no link
  that could resolve to a live host

A scenario is three files plus a build entry: the page under `pages/<module>/`, its behavior in
`src/scenarios/<id>.ts` exporting `run(ctx)`, its manifest in `data/scenarios/<id>.json`, and a
rollup input in `vite.config.ts`. Reuse a shared driver from `src/scenarios/_shared/` where the shape
already exists rather than duplicating it.

## Extending A Module

Every module is an extension point, and each module document ends with a *Planned coverage* section
naming the families and controls that are not built yet.

When you extend one:

- keep routing, ids, and naming stable
- add both directions where the axis warrants it — a positive scenario and a benign control
- document expected signals and intended detector coverage in the manifest, then update the module's
  document in `docs/en` and `docs/ru`
- prefer incremental scenario packs over large opaque drops
- mark anything the detector cannot yet see as ahead-of-detector in the manifest `notes`, rather than
  silently encoding an expectation nothing implements

## Before Submitting

All four gates must pass — `npm run verify` runs them in order:

```bash
npm run verify        # typecheck + lint + test + build
```

On a fresh clone, `npm run setup` handles the preflight checks and both installs (there are thin
`scripts/setup.ps1` and `scripts/setup.sh` wrappers that call the same script).

Tests cover the engine and infrastructure only. Scenario pages are intentionally variable and
imperfect, and are deliberately not test-covered — do not add tests that assert scenario DOM.

## Pull Request Expectations

Please keep pull requests focused and reviewable.

A pull request should include:

- a short problem statement
- a concise summary of what changed
- impacted modules or scenario families
- notes about expected detector behavior
- notes about new evaluation metadata, if added
- screenshots only when they materially help review

## Commit Sign-Off

Every commit must be signed off.

Use:

```bash
git commit -s -m "Your message"
```

If you forgot to sign off the last commit:

```bash
git commit --amend --signoff
```

## Safety Expectations

This repository contains controlled security research demos. Contributions must not:

- include real phishing operations
- include unauthorized tracking or telemetry
- include live malware payloads
- include credential collection flows
- depend on real-user interaction outside controlled testing
- embed uncontrolled third-party scripts for core functionality

## Review Criteria

Maintainers will typically review for:

- alignment with project scope
- safety and controlled-use properties
- detector-validation value
- reproducibility
- cross-browser practicality
- metadata quality
- documentation quality

## Questions

If a contribution is large, touches multiple scenario families, or changes the benchmark-lite model, open an issue or discussion first so the shape of the change can be aligned before implementation.
