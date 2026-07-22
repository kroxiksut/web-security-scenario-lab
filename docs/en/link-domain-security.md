# Link & Domain Security

Russian mirror: [`../ru/link-domain-security.md`](../ru/link-domain-security.md).

Presents links whose visible target and actual target disagree — homograph and mixed-script
hostnames, punycode-shaped labels, and unsafe protocols — so a detector can be validated on deceptive
navigation without any network lookup.

This is the lab's smallest module today: **two scenarios** — one positive and its benign control.
Its widening axes are listed under [Planned coverage](#planned-coverage).

## What it detects

A link is a promise about where a click goes, and the promise is made in the part a human reads: the
anchor text and the hostname inside it. Every classic deception breaks that promise somewhere the eye
cannot check — a Cyrillic `ѕ` that renders identically to Latin `s`, a punycode label the browser
displays in decoded form, a `javascript:` URL behind text that looks like an `https://` address.

The `link-domain-security` module's job is to recognize the disagreement regardless of:

- **Script mixing** — a hostname combining Latin with Cyrillic or Armenian code points that are
  visually indistinguishable from their Latin counterparts.
- **Punycode** — an `xn--`-prefixed label, which is what a mixed-script hostname actually resolves as.
- **Lookalike punctuation** — a Unicode hyphen (`U+2010`) standing in for the ASCII hyphen-minus.
- **Protocol** — `javascript:` and other unsafe schemes hiding behind trustworthy-looking link text.
- **Text/target mismatch** — anchor text naming one host while the destination is another.

## Scenarios

| id | page | role | expectedSignal | severity |
| --- | --- | --- | --- | --- |
| `homographs-rotator` | `pages/link-domain-security/homographs.html` | positive | `link-target-mismatch` | medium |
| `homographs-benign` | `pages/link-domain-security/benign.html` | benign control | `none` | low |

### `homographs-rotator`

- **Page:** `pages/link-domain-security/homographs.html`
- **`shouldFire`:** `true` · **severity:** `medium`
- **Coverage dimensions:** punycode or homograph pattern, mixed-script domain, deceptive host carried
  in the anchor href, visible-target mismatch, unsafe protocol or schema obfuscation.
- **Why it fires:** the page shows three link cards side by side — one whose visible text claims
  `https://trusted-bank.example` while its `href` carries a deceptive homograph/mixed-script variant
  of that hostname, one whose visible text claims an `https://` address while the actual `href` is
  `javascript:void(0)`, and one ordinary matching link as an in-page contrast.

The deception is encoded **in the anchor itself**, the way a real page would express it: the text and
the `href` disagree in the DOM, and the metadata rows below each link are only a reviewer-facing
readout of that same pair. The deceptive hostname is not fixed either — a seeded rotation picks one
candidate per seed, so the exact trick varies reproducibly across runs while the page structure stays
stable.

| Candidate | Trick |
| --- | --- |
| `https://trռsted-bank.example` | Armenian `ռ` (U+057C) standing in for Latin `u` |
| `https://truѕted-bank.example` | Cyrillic `ѕ` (U+0455) standing in for Latin `s` |
| `https://xn--trusted-bank-1a.example` | Punycode-shaped label |
| `https://trusted‐bank.example` | Unicode hyphen (U+2010) instead of ASCII `-` |

Every candidate uses an RFC 2606 reserved domain (`.example`) and therefore never resolves to a live
host — clicking through the lab cannot reach anything real.

### `homographs-benign` — false-positive control

- **Page:** `pages/link-domain-security/benign.html`
- **`shouldFire`:** `false` · **severity:** `low` · **expectedSignal:** `none`
- **Coverage dimensions:** matching visible text and href, legitimate single-script internationalized
  domain, same host with a deeper path, anchor text that claims no hostname, same-origin redirect
  parameter, non-HTTP but safe scheme (`mailto:`).
- **Why it's benign:** every link is honest, but each one trips a *naive* version of one of this
  module's heuristics. A single-script internationalized domain (`münchen.example`,
  `пример.example`, `例え.example` — rotated per seed) is non-ASCII without impersonating anything.
  A deeper path on the same host is not a target mismatch. Anchor text that reads "Open the
  documentation" claims no hostname, so there is nothing to compare it against. A `next=` parameter
  pointing back into the lab is not an open redirect. `mailto:` is a non-HTTP scheme that is not
  unsafe. A detector that flags non-ASCII hosts, any path difference, or any redirect parameter fires
  here and is wrong.

The internationalized-domain card is the sharpest of these: because `new URL(href).hostname` returns
the **punycode** form (`xn--mnchen-3ya.example`) while the anchor text shows the decoded form, a
mismatch check that compares those two strings directly reports a finding on a link whose text and
`href` are byte-identical in the markup. Compare the raw `getAttribute("href")`, or normalize both
sides to the same form, before concluding anything.

## How detection works

Both signals on the positive page live in the anchors themselves. The unsafe-protocol card has a
`javascript:` URL behind text that reads like an `https://` address, and the mismatch card has a
homograph hostname in its `href` behind text claiming the Latin original — so comparing text against
target catches both.

```js
for (const a of document.querySelectorAll("a[href]")) {
  const href = a.getAttribute("href") ?? "";
  if (/^\s*(javascript|data|vbscript):/i.test(href)) flag(a, "unsafe-protocol");

  // Text that looks like a URL but names a different host than the destination.
  const claimed = (a.textContent ?? "").match(/https?:\/\/([^/\s]+)/i)?.[1];
  if (claimed && href.startsWith("http") && new URL(href).hostname !== claimed) {
    flag(a, "link-target-mismatch");
  }
}
```

The homograph signal is about the hostname itself, and is best checked by script rather than by
character lists — a hostname label mixing Unicode scripts, or already in `xn--` form, is the
detectable property:

```js
const SCRIPTS = [/\p{Script=Cyrillic}/u, /\p{Script=Armenian}/u, /\p{Script=Greek}/u];
function suspiciousHost(host) {
  if (host.startsWith("xn--") || host.includes(".xn--")) return "punycode";
  const nonAscii = SCRIPTS.filter((re) => re.test(host)).length;
  if (nonAscii && /[a-z]/i.test(host)) return "mixed-script";
  if (/[‐‑‒–]/.test(host)) return "lookalike-punctuation"; // non-ASCII hyphens
  return null;
}
```

Note that `new URL(...).hostname` returns the **decoded** form in some engines and the punycode form
in others; normalize before comparing, and treat a host that changes under `URL` parsing as a signal
in its own right.

## Planned coverage

This module is the lab's least developed one. Remaining targets from its original coverage
requirements, none of which requires an information-architecture change:

- Anchor text and `href` rerolled **independently** per seed.
- `http` vs `https` downgrade samples.
- Redirect-parameter patterns (`?next=`, `?url=`), including parameters swapped after a delay.
- Lists of links regenerated per seed mixing safe and suspicious samples.
- Links rendered by a framework (jQuery / React / Vue) and inside shadow-root or iframe contexts, the
  way `visual-manipulation` already covers those runtimes.
- An **open-redirect pair** — a `?next=` parameter pointing off-site as a positive, against the
  same-origin `next=` already covered by the benign control.

## Ground truth & evaluation

Each scenario's manifest under `data/scenarios/homographs-*.json`
is the source of truth for what the detector is expected to do on the page: `expectedSignal` names the
finding family, `shouldFire` states whether a finding is required, and `severity` records the expected
priority — `medium` here rather than the `high` used by the hidden-content module, because a
deceptive link is a weaker signal than smuggled invisible instructions. `tags` and
`coverageDimensions` describe which axes the page exercises. The `whyFlagged` text is written for a
human reviewer; the `detectionExamples` field is illustrative only — a non-executed reference snippet,
not the actual detector code.

## Safety notes

- **No real brands and no live domains.** Every hostname on both pages is an RFC 2606 reserved name
  (`.example`) that cannot resolve, including the homograph variants and the internationalized
  domains on the benign control. This is a hard rule across the lab, and a link-safety check enforces
  it.
- The unsafe-protocol sample uses `javascript:void(0)` — inert by construction; it navigates nowhere
  and executes nothing.
- No network lookups are performed by the lab itself: candidates come from a local list, and nothing
  is resolved, fetched, or reported anywhere.
