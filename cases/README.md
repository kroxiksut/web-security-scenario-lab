# Cases Registry

This directory stores research cases derived from real observations, controlled references, archived examples, and sanitized reproductions.

The purpose of `cases/` is to bridge real-world findings and lab scenarios.

## Why This Exists

The main scenario lab contains controlled reproducible pages. The `cases/` registry exists so researchers can record where ideas came from, which signals were observed in the wild, and whether those observations were already converted into benchmark-lite scenarios.

## Primary Goals

- preserve research references without turning the project into a live threat feed
- map real findings to reproducible local scenarios
- document detector-relevant signals in a structured way
- support browser-extension QA and regression work with real-world inspiration
- keep records reviewable, redacted when needed, and safe for publication

## Source Of Truth

Case records should be stored as Markdown files.

Reasons:

- easier diff and code review in Git
- safer than using active HTML as the primary source
- simpler to redact dangerous links and unsafe content
- easier to enrich with structured metadata later
- easier to generate future HTML or JSON views from Markdown than the reverse

HTML may be generated later for browsing, but Markdown is the primary authoring and review format.

## Directory Layout

```text
cases/
|-- README.md
|-- README.ru.md
|-- CASE-TEMPLATE.md
|-- CASE-TEMPLATE.ru.md
|-- INDEX.md
|-- visual-manipulation/
|-- link-domain-security/
|-- trigger-phrases/
|-- prompt-splitting/
|-- api-interception/
|-- cross-module/
`-- assets/
```

## Category Rules

Create a category when at least one of the following is true:

- the case clearly maps to one detector module
- the case belongs to a stable signal family that multiple scenarios may reuse
- the case spans more than one module and needs a neutral home

Do not create a new category for every small heuristic.

Prefer:

- module categories for detector-specific findings
- `cross-module/` for cases that combine several signal families
- `assets/` for screenshots, sanitized HTML, archives, and supporting files

## Naming Rules

Each case should use a stable identifier.

Recommended pattern:

- `VM-YYYY-NNN.md` for `visual-manipulation`
- `LDS-YYYY-NNN.md` for `link-domain-security`
- `TP-YYYY-NNN.md` for `trigger-phrases`
- `PS-YYYY-NNN.md` for `prompt-splitting`
- `API-YYYY-NNN.md` for `api-interception`
- `XM-YYYY-NNN.md` for `cross-module`

Example:

- `LDS-2026-001.md`

## Safety Rules

Case records must not become a public list of actively dangerous links.

- use redacted URLs when needed
- prefer `example[.]com` style safe display forms
- do not publish tokens, credentials, personal data, or live malicious payloads
- do not turn case files into executable demos
- record only what is needed for research, validation, and scenario mapping

## Status Suggestions

Suggested case statuses:

- `draft`
- `confirmed`
- `redacted`
- `archived`
- `mapped-to-lab`
- `needs-reproduction`

## Scenario Mapping

A good case file should say whether the observation has been mapped into the lab.

Recommended fields:

- `reproducibleInLab`
- `scenarioMapping`
- `coverageDimensions`
- `expectedSignal`

## Community Translations

English is the default language for case files.

Process and documentation files may exist in English and Russian now, and can later be extended with community translations using additional `*.xx.md` files.
