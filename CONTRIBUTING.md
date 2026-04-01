# Contributing

Thank you for considering a contribution to Web Security Scenario Lab.

This repository is intended to be published under the Apache License 2.0. Unless explicitly stated otherwise, submitted contributions are expected to be offered under the same license terms as the repository.

All contributors must follow the Developer Certificate of Origin process described in [`DCO.md`](DCO.md).

## Contribution Priorities

Contributions are especially welcome in the following areas:

- new reproducible browser-side scenarios
- regression-oriented scenario improvements
- evaluation metadata and expected outcome definitions
- coverage-matrix improvements
- benchmark-lite UI improvements such as `why flagged` and signal panels
- planned module implementations for:
  - `trigger-phrases`
  - `prompt-splitting`
  - `api-interception`
- cross-browser behavior validation
- documentation clarifications

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
- include severity, tags, and rationale where applicable
- keep malicious-looking behavior simulated and controlled
- avoid live internet dependencies when a local equivalent can be used
- avoid hidden behavior that reviewers cannot understand from the diff
- keep dynamic mutations tied to expected evaluation outputs

## Placeholder And Planned Modules

Planned modules are not filler. They are extension points.

If you contribute to a planned module:

- keep routing and naming stable
- add placeholder-safe behavior first if the implementation is incomplete
- document expected signals and intended detector coverage
- prefer incremental scenario packs over large opaque drops

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
