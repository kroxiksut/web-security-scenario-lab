# Visual Manipulation

Russian mirror: [`../ru/visual-manipulation.md`](../ru/visual-manipulation.md).

Plants text that a human reader cannot see but the DOM still carries, using CSS suppression, DOM
boundaries (shadow roots, child frames), and framework-managed rendering — so a detector can be
validated against concealment that survives every common way a page is built.

This is the lab's largest module: **22 of the 36 scenarios**, because the same concealment payload is
reproduced across 18 framework/version combinations.

## What it detects

Content can be present in the DOM, reachable by anything that reads the page programmatically, and
still be invisible to the person looking at the screen. That gap is the whole threat model:
instructions, markers, or deceptive text are smuggled past the human while remaining fully available
to whatever parses the document.

The `visual-manipulation` module's job is to recognize suppressed-but-present content regardless of:

- **Technique** — near-zero opacity, off-screen positioning, clipping, sub-pixel font size, or an
  overlay masking content by `z-index`.
- **Styling mechanism** — inline styles written by a script, stylesheet classes, or utility CSS
  (Tailwind `sr-only`), where the suppression is only visible through the *computed* style.
- **DOM boundary** — light DOM, an open shadow root, a nested shadow root one boundary deeper, or a
  same-origin child frame created via `srcdoc`.
- **Rendering runtime** — hand-written markup, or DOM produced and owned by React, Vue, Svelte,
  Angular, Solid, Preact, Lit, jQuery, htmx, or Alpine, including deliberately legacy majors.
- **Timing** — every scenario ships a button that injects further hidden nodes, sometimes after a
  randomized delay, exercising the detector's mutation handling rather than a one-shot page scan.

## Scenarios

The 21 positive scenarios share one evaluation ground truth: `expectedSignal:
hidden-content-manipulation`, `shouldFire: true`, `severity: high`. They differ in the axis of the
threat model they exercise, which is what their `tags` and `coverageDimensions` record. One benign
control asserts the opposite verdict.

### Core pages

| id | page | axis exercised |
| --- | --- | --- |
| `hidden-text-mixed` | `pages/visual-manipulation/hidden-text.html` | Baseline: opacity, off-screen, clipping, and z-index masking on one hand-written page |
| `hidden-text-shadow-dom` | `pages/visual-manipulation/shadow-dom.html` | Open shadow root plus a nested inner shadow root — recursive traversal |
| `hidden-text-iframe` | `pages/visual-manipulation/iframe.html` | Same-origin child frame via `srcdoc` — descent into `contentDocument` |
| `hidden-text-benign` | `pages/visual-manipulation/benign.html` | **Benign control** (`shouldFire: false`): the same techniques used for legitimate UI |

### `hidden-text-benign` — false-positive control

- **Page:** `pages/visual-manipulation/benign.html`
- **`shouldFire`:** `false` · **severity:** `low` · **expectedSignal:** `none`
- **Coverage dimensions:** screen-reader-only text (clip technique), skip link revealed on focus,
  collapsed disclosure widget (`display: none`), inactive ARIA tab panels (`[hidden]`), off-screen
  carousel slides, user-reachable hidden content.
- **Why it's benign:** every node invisible at load is invisible for an ordinary UI reason, and the
  user can reach all of it by normal interaction — an `sr-only` label describing an icon button, a
  skip link that appears on focus, a collapsed `<details>` body, the two inactive panels of an ARIA
  tab group, and the parked slides of a quote carousel. The suppression **techniques are deliberately
  identical to the positives**: `.vm-sr-only` is the same `clip: rect(0 0 0 0)` trick as
  `.vm-clipped`, and the carousel parks slides at `left: -9999px` exactly like the off-screen
  positive. What differs is the content (ordinary product copy, not smuggled instructions) and its
  reachability. A detector keyed only on "text present but not rendered" fires here and is wrong.

This is the module's false-positive guard, part of the shared benign matrix.

### Framework matrix

The same hidden-text payload rendered by each supported runtime. **Library version is a coverage
dimension** — different majors emit different DOM and mutation signatures — so legacy majors are
pinned deliberately and carry the `legacy-version` tag.

| Library | Version | id | page |
| --- | --- | --- | --- |
| React | 17 (legacy) | `hidden-text-react17` | `frameworks/react/v17/hidden-text.html` |
| React | 18 | `hidden-text-react18` | `frameworks/react/v18/hidden-text.html` |
| React | 19 | `hidden-text-react19` | `frameworks/react/v19/hidden-text.html` |
| Vue | 2.7 (legacy) | `hidden-text-vue2` | `frameworks/vue/v2/hidden-text.html` |
| Vue | 3 | `hidden-text-vue3` | `frameworks/vue/v3/hidden-text.html` |
| jQuery | 1.12 (legacy) | `hidden-text-jquery-legacy` | `frameworks/jquery/v1/hidden-text.html` |
| jQuery | 3.7 | `hidden-text-jquery` | `frameworks/jquery/v3/hidden-text.html` |
| Angular | 22 | `hidden-text-angular` | `frameworks/angular/v22/hidden-text.html` |
| Svelte | 5 | `hidden-text-svelte` | `frameworks/svelte/v5/hidden-text.html` |
| Solid | 1 | `hidden-text-solid` | `frameworks/solid/v1/hidden-text.html` |
| Preact | 10 | `hidden-text-preact` | `frameworks/preact/v10/hidden-text.html` |
| Lit | 2 (legacy) | `hidden-text-lit-legacy` | `frameworks/lit/v2/hidden-text.html` |
| Lit | 3 | `hidden-text-lit` | `frameworks/lit/v3/hidden-text.html` |
| htmx | 1.9 (legacy) | `hidden-text-htmx-legacy` | `frameworks/htmx/v1/hidden-text.html` |
| htmx | 2 | `hidden-text-htmx` | `frameworks/htmx/v2/hidden-text.html` |
| Alpine | 2 (legacy) | `hidden-text-alpine-legacy` | `frameworks/alpine/v2/hidden-text.html` |
| Alpine | 3 | `hidden-text-alpine` | `frameworks/alpine/v3/hidden-text.html` |
| Tailwind | 4 | `hidden-text-tailwind` | `frameworks/tailwind/v4/hidden-text.html` |

Each framework page adds its own runtime-specific dimension on top of the shared payload — Lit hides
content inside a **shadow root** rendered from a template, htmx inserts it through an **AJAX
out-of-band swap**, Tailwind suppresses via **utility classes** so nothing is visible in the inline
`style` attribute, Angular runs **zoneless AOT-compiled** change detection, Solid and Svelte mutate
the DOM **without a virtual DOM** at all. The live coverage view at `pages/frameworks/index.html`
renders this matrix from [`data/frameworks.json`](../../data/frameworks.json); to add a library or a
version, see [Adding a Framework or Version](./adding-frameworks.md).

## How detection works

The concealment techniques are shared across scenarios and applied to nodes that carry real text
content:

| Technique | What the scenario does | Why a human misses it |
| --- | --- | --- |
| Opacity | `opacity: 0.02` | Rendered, laid out, effectively invisible |
| Off-screen | `position: absolute; left: -9999px` | Outside the viewport, never scrolled to |
| Clipping | `position: absolute; clip: rect(0, 0, 0, 0)` | Clipped to a zero-area rectangle |
| Tiny font | `font-size: 0.1px` | Sub-pixel, unreadable |
| Z-index masking | Overlay banner stacked above the content | Covered by another element |

Crucially, only the first page writes these as inline styles. The Tailwind scenario reaches the same
result through utility classes (`sr-only`), so a detector reading `element.style` sees nothing —
`getComputedStyle` is the reliable source:

```js
for (const el of document.querySelectorAll("*")) {
  if (!el.textContent?.trim()) continue;
  const cs = getComputedStyle(el);
  const offScreen = parseInt(cs.left, 10) < -1000 || parseInt(cs.top, 10) < -1000;
  if (parseFloat(cs.opacity) < 0.05 || parseFloat(cs.fontSize) < 1 || offScreen) flag(el);
}
```

`document.querySelectorAll("*")` alone is not enough for two of the core scenarios: shadow-root
content and child-frame content are invisible to a light-DOM query and require explicit descent.

```js
function* walk(root) {
  for (const el of root.querySelectorAll("*")) {
    yield el;
    if (el.shadowRoot) yield* walk(el.shadowRoot);              // open shadow roots, recursively
    if (el.tagName === "IFRAME" && el.contentDocument) yield* walk(el.contentDocument); // same-origin frames
  }
}
```

Because every scenario's injector can append nodes **after** a randomized delay, a single scan at
`DOMContentLoaded` will miss part of the payload by design; a `MutationObserver` (or equivalent
re-scan) is what the module is built to exercise.

The computed-style check above is necessary but **not sufficient**: run it against
`hidden-text-benign` and it flags five nodes that are all legitimate. Passing both scenarios requires
a second question — is this content reachable and does it serve a UI role? — which in practice means
excusing nodes that are referenced as accessibility labels (`aria-describedby`, `aria-labelledby`),
sit inside a `[role="tabpanel"]`, a closed `<details>`, or a carousel, or become visible on focus:

```js
const EXCUSED = '[role="tabpanel"], details, [aria-roledescription="carousel"], .skip-link';
function isLegitimatelyHidden(el) {
  if (el.id && document.querySelector(`[aria-describedby~="${el.id}"], [aria-labelledby~="${el.id}"]`))
    return true;
  return Boolean(el.closest(EXCUSED));
}
```

All concealed strings come from a small set of clearly marked lab snippets (`lab-marker: …`,
`hidden note (test): …`) chosen per seed, so the exact text varies reproducibly while staying
obviously synthetic.

## Planned coverage

The module's original coverage requirements list several families that are **not yet shipped as
scenarios**. They remain the target for widening this module, and none of them requires an
information-architecture change:

- Static suppression through `display: none` and `visibility: hidden` as scenarios in their own right
  (currently exercised only indirectly).
- Hidden and editable form surfaces — a hidden `input` inserted next to visible form controls, hidden
  `contenteditable` regions.
- A fixed-position full-page overlay, and an overlay that appears only after a delay.
- Styles rewritten on a timer; text toggled between visible and hidden states.
- Background/foreground contrast rerolled per seed (low-contrast text as its own axis).
- A second benign control on the framework axis — legitimate concealment authored by a component
  runtime, where framework-generated markup makes the reachability check harder.

## Ground truth & evaluation

Each scenario's manifest under `data/scenarios/hidden-text-*.json` is the source of truth for what the
detector is expected to do on that page: `expectedSignal` names the finding family, `shouldFire`
states whether a finding is required, and `severity` records the expected priority. `tags` and
`coverageDimensions` describe which axes (technique, styling mechanism, DOM boundary, framework,
version) that specific page exercises, so a detector's pass/fail can be attributed to a concrete
dimension rather than judged as one opaque page. The `whyFlagged` text is written for a human
reviewer; the `detectionExamples` field is illustrative only — a non-executed reference snippet, not
the actual detector code.

## Safety notes

- All concealed strings are synthetic lab markers. Nothing is a working payload, and nothing is
  copy-pasteable into an attack.
- Scenarios never fetch remote content: the child frame is built from an inline `srcdoc`, and the one
  scenario that does issue a request — the htmx swap — reads a static fragment
  (`public/lab-fragments/htmx-hidden.html`) from the lab's own origin.
- All framework libraries are vendored and pinned locally — no runtime CDN dependency, so the pages
  work offline and their versions never drift.
