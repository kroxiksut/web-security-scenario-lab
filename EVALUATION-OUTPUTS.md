# Evaluation Outputs

## Goal

The lab should produce researcher-facing evaluation artifacts in addition to rendered scenarios. This is what turns a scenario catalog into a benchmark-lite regression environment.

## Core Evaluation Fields

Each mature scenario should be able to expose:

- `expectedSignal`
- `shouldFire`
- `severity`
- `tags`
- `whyFlagged`
- `whyBenign` where applicable
- `coverageDimensions`
- `notes`

## Expected Meanings

- `expectedSignal`: the detector family or heuristic category the page is intended to exercise
- `shouldFire`: whether the detector is expected to trigger on this scenario variant
- `severity`: relative seriousness of the embedded signal pattern
- `tags`: short searchable descriptors for routing, filtering, and coverage analysis
- `whyFlagged`: concise explanation of why the active page variant is suspicious
- `whyBenign`: explanation for negative-control cases
- `coverageDimensions`: normalized labels for the concrete rendering or link tricks present in the page
- `notes`: extra research context when needed

## UI Targets

The benchmark-lite UI should eventually expose:

- a `why flagged` panel
- an expected outcome summary
- signal tags
- severity badge
- benign versus suspicious status
- coverage matrix entries for the active scenario

## Coverage Dimension Examples

- hidden text
- color match
- tiny font
- off-screen placement
- clipping
- opacity suppression
- z-index masking
- misleading anchor text
- visible-target mismatch
- punycode or homograph pattern
- mixed-script domain
- unsafe protocol or schema obfuscation
- redirect parameter abuse

## Negative Controls

Not every scenario must be malicious-looking. The lab should also include intentionally benign or borderline pages so false-positive behavior can be studied.

## Storage Direction

Evaluation outputs should be stored as structured metadata next to scenario definitions, not buried only in prose.
