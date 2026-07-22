# Detection Modules

Russian mirror: [`../ru/README.md`](../ru/README.md).

The lab is organized into **detection modules**, each mapping 1:1 to a module of the PageCheck
detector. A module owns a family of page manipulations, a set of scenario pages that reproduce them,
and the ground truth those pages are scored against: every scenario's manifest under
`data/scenarios/` states which signal the detector must report, whether it must fire at all, at what
severity, and why.

Modules divide into two groups by what an attacker is aiming at — **the human looking at the page**,
or **an AI agent reading it**.

## Aimed at the human reader

Manipulation that misleads the person in front of the screen: content they cannot see, or a link that
does not go where it claims.

- [Visual Manipulation](./visual-manipulation.md) — text present in the DOM but suppressed from view
  by CSS (near-zero opacity, off-screen placement, clipping, sub-pixel fonts, z-index masking), hidden
  behind DOM boundaries (open and nested shadow roots, same-origin child frames), and reproduced
  across 18 framework/version combinations so the detector is exercised against framework-authored
  DOM, not just hand-written markup, plus a benign control where the same techniques serve legitimate
  UI. **22 scenarios** — the lab's largest module.
- [Link & Domain Security](./link-domain-security.md) — links whose visible target and actual target
  disagree: homograph and mixed-script hostnames carried in the anchor's own `href`, punycode-shaped
  labels, lookalike punctuation, and unsafe protocols behind trustworthy-looking text, rotated per
  seed, plus a benign control of honest links that trip naive versions of those heuristics.
  **2 scenarios.**

## Aimed at an AI agent reading the page

Content written not for a human reader but for an AI assistant that reads the page — a
prompt-injection-style instruction, that same instruction split across DOM fragments to dodge a
single-string check, and API-shaped interaction surfaces an agent might be steered toward.

- [Trigger Phrases](./trigger-phrases.md) — synthetic prompt-injection instructions planted across
  visible text and text-bearing attributes (`title`, `aria-label`, `alt`), in English and Russian,
  including a Unicode-normalization evasion variant and a quoted/code-context benign control.
  **3 scenarios.**
- [Prompt Splitting](./prompt-splitting.md) — the same instruction corpus fragmented across
  consecutive DOM nodes within one local region (word-boundary "spaced" and mid-word "compact"
  assembly) or across the text-bearing attributes of an element chain ("attribute-chain"), each with
  a benign control (cross-region scatter / already-complete phrases, and an ordinary-tooltip chain).
  **5 scenarios.**
- [API Interception](./api-interception.md) — DOM attributes (`action`, `src`, `data-api`,
  `data-endpoint`) carrying API-shaped markers (`api`, `/v1/`, `/graphql`) plus a benign control with
  unmarked values, and a second axis, ahead of the detector's current signal, comparing a `data:`
  URI's declared MIME type against its actual first-byte signature, also with its own benign control.
  **4 scenarios.**

## Positive and benign scenarios

Every module ships both **positive** scenarios (the detector must fire, `shouldFire: true`) and at
least one **benign false-positive control** (the detector must stay silent, `shouldFire: false`). A
detector that flags everything is as broken as one that flags nothing, so both directions are ground
truth. Of the 36 scenarios, 29 are positive and 7 are benign controls.

Each benign control is built to trip a *naive* version of its module's own heuristic, so the pair is
what makes the module a test rather than a demo: the visual-manipulation control uses the exact CSS
suppression of its positives for legitimate UI, and the link control uses honest links whose hosts
are non-ASCII, whose paths differ, or whose text claims no host at all.

## Finding your way around

- The live **scenario catalog** (`pages/scenarios/index.html` in a running lab) lists all 36 scenarios
  grouped by module, with expected signal, verdict, severity, and tags — generated from the manifests,
  so it never drifts from the ground truth.
- The **framework coverage matrix** (`pages/frameworks/index.html`) shows which library versions the
  framework scenarios cover.
- [Getting Started](./getting-started.md) — how to run the lab on Windows or Linux.
- [Documentation index](./index.md) — the rest of the lab's documentation.
