# API Interception

Russian mirror: [`../ru/api-interception.md`](../ru/api-interception.md).

Exposes DOM attributes that look like they name an API endpoint — a form `action`, a
`data-api`/`data-endpoint` value — and, on a second axis, inline `data:` payloads whose declared
MIME type disagrees with their actual byte signature. Together these validate the module's
current attribute-marker signal, its declared-but-ahead-of-detector payload-signature scope, and a
false-positive control for each axis.

## What it detects

A page that talks to a backend API from client-side script (rather than doing plain form
navigation) is not inherently suspicious, but it is a relevant *surface* for a security detector
to know about: it is a place data can leave the page, and a place an attacker-controlled or
mimicking page might plant a look-alike endpoint. `api-interception` covers two distinct axes:

1. **Attribute markers (current detector signal).** The detector inspects a small set of
   attributes — `action`, `src`, `data-api`, `data-endpoint` — for values that carry one of three
   markers: an `api` token, a `/v1/` path segment, or a `/graphql` path segment. This is an
   *attribute-shaped* signal, not proof that a network request occurred: the module flags the
   presence of an API-looking value on a recognized attribute, nothing more. Presence of the
   attribute alone (with an unmarked value) is not sufficient — that is exactly what the attribute
   benign control asserts.

2. **Declared MIME vs. first-byte signature (ahead-of-detector, declared scope).** A `data:` URI
   declares a MIME type in its prefix (`data:image/png;base64,…`), but the decoded payload has its
   own real format identifiable by its leading "magic bytes." When the two disagree — content
   labeled `image/png` that actually decodes to a GIF, a PDF, an HTML document, a ZIP archive, or
   even a WebAssembly module — the declared type is spoofed: a content-type-confusion / payload-
   smuggling surface. This axis **is now a shipped, testable scenario pair** in this lab (see
   below), but it is explicitly ahead of PageCheck's *current* attribute-only signal: the detector
   does not yet parse `data:` payloads and compare declared type to actual bytes. Each manifest on
   this axis marks itself `ahead-of-detector` in its `tags` and documents this in `notes`, so it
   must not be read as something the shipped detector currently enforces — it is the scope the
   module has committed to, exercised here ahead of the implementation landing.

## Scenarios

| id | page | role | expectedSignal | severity |
| --- | --- | --- | --- | --- |
| `api-interception-endpoints` | `pages/api-interception/endpoints.html` | positive (attribute axis) | `api-surface-attribute` | medium |
| `api-interception-benign` | `pages/api-interception/benign.html` | benign control (attribute axis) | `none` | low |
| `api-interception-mime-signature` | `pages/api-interception/mime-signature.html` | positive (MIME/signature axis, ahead-of-detector) | `payload-signature-mismatch` | high |
| `api-interception-mime-benign` | `pages/api-interception/mime-benign.html` | benign control (MIME/signature axis, ahead-of-detector) | `none` | low |

### `api-interception-endpoints` — attribute surfaces

- **Page:** `pages/api-interception/endpoints.html`
- **`shouldFire`:** `true` · **severity:** `medium`
- **Coverage dimensions:** `action` attribute, `data-api` attribute, `data-endpoint` attribute,
  `/v1/` marker, `api` marker, `/graphql` marker, dynamic DOM injection.
- **Why it fires:** the page exposes API-shaped interaction surfaces — a form `action`, a
  `data-api` value, and a `data-endpoint` value — whose values carry the markers the detector keys
  on (`api`, `/v1/`, `/graphql`), hosted on RFC 2606 reserved domains, plus a runtime injector that
  adds further surfaces. This matches the module's current DOM-attribute signal for identifying an
  API surface.
- **Note (from the manifest):** this scenario is aligned to the **current** attribute signal — a
  lightweight surface marker, not evidence that a request occurred. The literal `src` attribute is
  deliberately deferred to avoid a runtime request to a non-resolving reserved domain: the `<img>`
  element instead uses a network-free `data:` URI for `src` and carries its API marker on
  `data-api`.

Concretely, the page plants (a fixed baseline plus a seeded subset of the rest, plus injector
additions):

| host element | attribute | value | marker |
| --- | --- | --- | --- |
| `<form>` (baseline) | `action` | `https://api.orders.example/v1/create` | `/v1/` |
| `<button>` | `data-api` | `https://api.auth.example/v1/token` | `api` |
| `<div>` | `data-endpoint` | `https://backend.example/graphql` | `/graphql` |
| `<img>` | `data-api` | `https://cdn.example/api/telemetry` | `api` |

All hosts are RFC 2606 reserved (`*.example`); the form's `submit` handler calls
`preventDefault()` so it never actually navigates, and the `<img src>` is an inline 1×1
transparent PNG data URI, so nothing on this page ever resolves a real host.

### `api-interception-benign` — unmarked attributes

- **Page:** `pages/api-interception/benign.html`
- **`shouldFire`:** `false` · **severity:** `low`
- **Coverage dimensions:** `action` attribute without marker, `data-api` attribute without marker,
  `data-endpoint` attribute without marker.
- **Why it's benign:** the page exposes the same attributes the detector inspects (`action`,
  `data-api`, `data-endpoint`), but their values carry none of the markers it keys on (`api`,
  `/v1/`, `/graphql`): an ordinary checkout form (`https://www.shop.example/checkout`), a static
  config path (`/static/site-config.json`), and a plain data attribute (`v2`). Presence of the
  attribute is not itself an API-surface signal — only a marked value is — so a finding here would
  be a false positive. This is the attribute axis's false-positive guard.

### `api-interception-mime-signature` — declared MIME vs. payload signature

- **Page:** `pages/api-interception/mime-signature.html`
- **`shouldFire`:** `true` · **severity:** `high`
- **Coverage dimensions:** `data:` URI declared MIME, decoded first-byte signature,
  declared-vs-actual mismatch, download-anchor `href`, `data-payload` attribute, dynamic DOM
  injection.
- **Why it fires:** the page carries inline `data:` URIs whose declared MIME type contradicts the
  format of their decoded first bytes — an `image/png` that is really a GIF, an `image/jpeg` that
  is really a PDF, an `image/png` that is really an HTML document, an `application/json` that is
  really a ZIP archive, an `image/gif` that is really a WebAssembly module. A declared content
  type that disagrees with the payload's magic bytes is content-type spoofing / payload
  smuggling — the module's declared payload-signature surface. Parsing the declared MIME and
  comparing it to the leading bytes should flag each mismatch.
- **Note (from the manifest, verbatim intent):** **ahead of the detector.** PageCheck's
  `api-interception` module today keys only on DOM-attribute markers (`api`, `/v1/`, `/graphql`);
  parsing a `data:` URI and comparing declared MIME to decoded first bytes is its declared-but-not-
  yet-built payload-signature scope, so this scenario leads the detector (the lab is explicitly
  allowed to lead ahead of the detector). Network-free by construction: every `data:` URI is
  inline and carried only on non-fetching surfaces (`data-*` attributes, a `download` anchor,
  visible code) — never a loading `src` — so nothing decodes or renders and no request is ever
  issued.

### `api-interception-mime-benign` — MIME matches signature

- **Page:** `pages/api-interception/mime-benign.html`
- **`shouldFire`:** `false` · **severity:** `low`
- **Coverage dimensions:** `data:` URI declared MIME matches signature, download-anchor `href`,
  `data-payload` attribute.
- **Why it's benign:** the page carries the same inline `data:` URIs on the same non-fetching
  surfaces as the positive, but each URI's declared MIME **agrees** with its decoded first-byte
  signature: a real PNG typed `image/png`, a real GIF typed `image/gif`, a real JPEG typed
  `image/jpeg`, a real ZIP typed `application/zip`, a real HTML document typed `text/html`. A
  correctly-typed payload is not content-type spoofing, so a payload-signature finding here would
  be a false positive. This is the counterpart to `api-interception-benign` — the MIME axis's
  false-positive guard, mirroring the attribute axis's unmarked-attributes control.

## How detection works

### Attribute-marker axis

The positive scenario's driver
([`src/scenarios/api-interception-endpoints.ts`](../../src/scenarios/api-interception-endpoints.ts))
plants a fixed baseline (the form) plus a seeded spread of the other three surfaces, then appends
an "Add API surface" button that injects one more (sometimes after a randomized delay) to exercise
the detector's mutation queue. The benign scenario's driver
([`src/scenarios/api-interception-benign.ts`](../../src/scenarios/api-interception-benign.ts))
plants the same three attribute/host shapes but with values that intentionally contain none of the
three markers.

A detector matching the module's current signal reads the four candidate attributes and tests
each present value against the marker pattern:

```js
const ATTRS = ["action", "src", "data-api", "data-endpoint"];
const MARKER = /(?:^|[^a-z])api|\/v1\/|\/graphql/i;
for (const el of document.querySelectorAll("[action],[src],[data-api],[data-endpoint]")) {
  if (ATTRS.some((a) => MARKER.test(el.getAttribute(a) || ""))) flag(el);
}
```

### MIME/signature axis (ahead of detector)

Both MIME-axis scenarios share one driver,
[`src/scenarios/_shared/apiMimeSignatureDriver.ts`](../../src/scenarios/_shared/apiMimeSignatureDriver.ts).
It maintains a small table of known file signatures (PNG, GIF89a, JPEG, PDF, ZIP, HTML, WASM) and
builds a base64 `data:` URI whose decoded bytes deterministically begin with one format's magic
bytes, regardless of the MIME type declared in the URI's prefix. A `mode` parameter selects which
case table to plant: `"mismatch"` (declared type disagrees with actual bytes — the positive) or
`"match"` (declared type agrees — the benign control). Each planted payload is carried only on
non-fetching surfaces — a `download` anchor's `href`, and a `data-payload` attribute on a plain
`<div>` — deliberately never on a loading `src`, so nothing ever decodes or renders and no network
request is possible.

A detector implementing this declared scope would decode the base64 payload's leading bytes,
compare them against known magic-number signatures, and compare the *detected* format to the
*declared* MIME type from the URI prefix:

```js
const MAGIC = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
];
function firstBytes(dataUri) {
  const [head, b64] = dataUri.split(",");
  if (!/;base64$/.test(head.split(":")[1] || "")) return null;
  const bin = atob(b64.slice(0, 16));
  return [...bin].map((c) => c.charCodeAt(0));
}
for (const el of document.querySelectorAll('[href^="data:"],[data-payload^="data:"],[src^="data:"]')) {
  const uri = el.getAttribute("href") || el.getAttribute("data-payload") || el.getAttribute("src");
  const declared = (uri.split(":")[1] || "").split(";")[0];
  const bytes = firstBytes(uri);
  if (!bytes) continue;
  const looksLike = MAGIC.find((m) => m.bytes.every((b, i) => bytes[i] === b));
  if (looksLike && looksLike.mime !== declared) flag(el, declared, looksLike.mime);
}
```

This is a byte-level check, distinct from the attribute-marker signal above. At the time of
writing, PageCheck's `api-interception` module has **not yet implemented** this comparison — its
shipped detector still keys only on the attribute markers. The manifests explicitly tag this axis
`ahead-of-detector` and record the same intent in `notes`, using the same mechanism the endpoints
scenario already uses to flag its own deferred `src` case.

## Ground truth & evaluation

Each scenario's manifest under `data/scenarios/api-interception-*.json` is the source of truth:
`expectedSignal` names the finding family (`api-surface-attribute` for the attribute-axis
positive, `payload-signature-mismatch` for the MIME-axis positive, `none` for both benign
controls), `shouldFire` states whether a finding is required or forbidden, and `severity` records
the expected priority — `medium` for an attribute-level surface marker versus `high` for a
confirmed content-type spoof, reflecting that a byte-level mismatch is stronger evidence than an
attribute-shaped guess. `tags` and `coverageDimensions` record which attribute/marker or which
MIME/signature pair each scenario exercises, and which axis is `ahead-of-detector`. The `notes`
field is where this module records signal-maturity context that is important for interpreting a
detector's pass/fail without over- or under-crediting it: a detector that does not yet fire on the
MIME-axis positive is not necessarily broken — it may simply not have implemented that declared
scope yet.

## Safety notes

- All endpoint-shaped values and any hostnames referenced use RFC 2606 reserved domains
  (`*.example`) that never resolve.
- No scenario performs a real network request. On the attribute axis, the form's submit is
  intercepted with `preventDefault()`, and the one `<img>` uses an inline data URI rather than a
  literal remote `src`. On the MIME/signature axis, every payload is an inline `data:` URI carried
  only on non-fetching surfaces (a `download` anchor that is never clicked, a plain `data-payload`
  attribute) — never a loading `src` — so nothing ever decodes, renders, or requests anything.
- The MIME/signature axis is explicitly marked ahead-of-detector in both scenarios' `tags` and
  `notes`; it documents scope the module has committed to but that PageCheck's shipped detector
  does not yet enforce, and must not be presented as a currently-enforced signal.
