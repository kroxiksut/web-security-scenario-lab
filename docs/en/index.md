# Documentation Index (EN)

English documentation for Web Security Scenario Lab. Russian mirror: [`../ru/index.md`](../ru/index.md).

> Documents live in `docs/en/` with a Russian mirror in `docs/ru/`. Several core documents still live
> in the repository root and will be migrated here incrementally; links below point to their current
> location.

## Start here
- [Getting Started](./getting-started.md) — separate step-by-step walkthroughs for Windows and Linux:
  requirements, install, dev server, static build and how to serve it, deep-link parameters, quality gates
- [README](../../README.md) — project overview and positioning
- [Architecture](../../ARCHITECTURE.md) — directory model, engine, evaluation, tooling

## Detection modules
[Overview of all modules](./README.md) — what each one covers and how positive and benign scenarios
relate.

Aimed at the human reader:
- [Visual Manipulation](./visual-manipulation.md)
- [Link & Domain Security](./link-domain-security.md)

Aimed at an AI agent reading the page:
- [Trigger Phrases](./trigger-phrases.md)
- [Prompt Splitting](./prompt-splitting.md)
- [API Interception](./api-interception.md)

## Scenario model
- [Scenario Dynamics](../../SCENARIO-DYNAMICS.md) — randomization, seeds, mutation rules
- [Evaluation Outputs](../../EVALUATION-OUTPUTS.md) — ground-truth fields, `detectionExamples`
- [Adding a Framework or Version](./adding-frameworks.md) — framework robustness pages, the coverage
  matrix, install strategies (root alias vs nested node_modules), and the verify checklist
- [Cases Registry](../../cases/README.md) — how real-world observations are recorded as Markdown case
  records and mapped to lab scenarios

## Platform & policy
- [Browser Compatibility](../../BROWSER-COMPATIBILITY.md)
- [I18N](../../I18N.md)
- [Security & Deployment](../../SECURITY-DEPLOYMENT.md)
- [Roadmap](../../ROADMAP.md) — staged delivery plan
- [Contributing](../../CONTRIBUTING.md) · [DCO](../../DCO.md)
