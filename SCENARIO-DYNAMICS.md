# Scenario Dynamics

## Objective

The lab must not rely on one fixed HTML sample per case. Each scenario family should support controlled variation so detector behavior can be checked against many related page states and the resulting evaluation outputs remain reproducible.

## Dynamic Modes

- `static`: fixed, reproducible markup
- `seeded`: random but reproducible by seed
- `live-reroll`: new variant on each refresh or reroll
- `timed-dynamic`: content mutates after page load

## Mutation Sources

- text replacement
- style replacement
- class shuffling
- background changes
- injected hidden nodes
- delayed overlays
- regenerated links
- domain label substitution
- attribute mutation

## Reproducibility

Randomness must be controlled through a seed.

- same seed -> same scenario output
- different seed -> different scenario output
- same seed -> same evaluation metadata for the same scenario version
- seed should be visible in the UI
- seed should be accepted through query string

## Link Regeneration

For `link-domain-security`, the engine should support:

- visible text and `href` mismatch rotation
- homograph candidate rotation
- punycode and mixed-script samples
- redirect parameter substitution
- unsafe protocol swaps
- target hostname replacement

## Visual Regeneration

For `visual-manipulation`, the engine should support:

- hidden text shown through different concealment patterns
- random font color and background combinations
- clipping and off-screen position variants
- opacity and filter variants
- overlay size and z-index changes
- hidden inputs or editable regions inserted at different depths

## Trigger Models

Dynamic updates should be available through:

- page load
- refresh
- manual reroll button
- timer-based mutation
- simulated user interaction

## Evaluation Coupling

Scenario mutation should stay coupled to evaluation metadata.

- every generated variant should resolve to an expected signal profile
- suspicious and benign variants should be distinguishable in metadata
- coverage tags should survive rerolls of the same scenario family
- `why flagged` explanations should be derived from the active variant rather than static text only

## Safety Rules

- No dynamic code execution from untrusted input
- No runtime HTML assembled from external sources
- Templates must come from local manifests or local code
- Dangerous content is simulated, not accepted from users
