# Phase 4 — AI / Prompt-Injection Modules

Russian mirror: [`../ru/README.md`](../ru/README.md).

Phase 4 adds three scenario modules that validate PageCheck's detection of AI-agent-directed
manipulation on a page — content written not for a human reader but for an AI assistant reading
the page (a prompt-injection-style instruction, that same instruction split across DOM fragments
to dodge a single-string check, and API-shaped interaction surfaces an agent might be steered
toward). Every module ships both **positive** scenarios (the detector must fire) and a **benign
false-positive control** (the detector must stay silent), and every scenario's manifest under
`data/scenarios/` is the ground truth a detector run is scored against.

## Modules

- [Trigger Phrases](./trigger-phrases.md) — synthetic prompt-injection instructions planted across
  visible text and text-bearing attributes (`title`, `aria-label`, `alt`), in English and Russian,
  including a Unicode-normalization evasion variant and a quoted/code-context benign control.
- [Prompt Splitting](./prompt-splitting.md) — the same instruction corpus fragmented across
  consecutive DOM nodes within one local region (word-boundary "spaced" and mid-word "compact"
  assembly) or across the text-bearing attributes of an element chain ("attribute-chain"), each with
  a benign control (cross-region scatter / already-complete phrases, and an ordinary-tooltip chain).
- [API Interception](./api-interception.md) — DOM attributes (`action`, `src`, `data-api`,
  `data-endpoint`) carrying API-shaped markers (`api`, `/v1/`, `/graphql`) plus a benign control
  with unmarked values, and a second axis, ahead of the detector's current signal, comparing a
  `data:` URI's declared MIME type against its actual first-byte signature, also with its own
  benign control.

See the [main documentation index](./index.md) for the rest of the lab's documentation.
