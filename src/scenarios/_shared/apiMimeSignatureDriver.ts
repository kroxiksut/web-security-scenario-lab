import type { ScenarioContext } from "../context.ts";

/**
 * Shared driver for the api-interception **declared-MIME vs first-byte-signature** axis.
 *
 * A `data:` URI declares a MIME type in its prefix (`data:image/png;base64,...`) but the decoded
 * payload has its own real format, identifiable by its leading magic bytes. When the two disagree
 * — an `image/png` whose bytes are actually a PDF, a ZIP, or HTML — the declared type is spoofed:
 * a payload-smuggling / content-type-confusion surface. This driver plants such URIs (positive) or
 * correctly-typed ones (benign control) depending on `mode`.
 *
 * **Ahead of the detector's current scope.** PageCheck's api-interception module today keys on
 * DOM-attribute markers (`api`, `/v1/`, `/graphql`); parsing a `data:` URI and comparing its
 * declared MIME to the decoded first bytes is the module's *declared but not-yet-built* scope. The
 * manifests mark this via `notes`; the scenario leads the detector (the lab may lead — see AGENTS.md).
 *
 * **Network-free by construction.** Every `data:` URI is inline and is carried only on non-fetching
 * surfaces (`data-*` attributes, a `download` anchor, visible `<code>`) — never on a loading `src`,
 * so nothing decodes/renders and no request is ever issued (same discipline as the endpoints slice).
 * The `param`-injection shape (a `mode` argument) mirrors the other shared drivers.
 */

export type MimeMode = "mismatch" | "match";

/** A known file format identified by its leading magic bytes. */
interface Signature {
  name: string;
  bytes: readonly number[];
}

const SIGNATURES = {
  png: { name: "PNG", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  gif: { name: "GIF89a", bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] },
  jpeg: { name: "JPEG", bytes: [0xff, 0xd8, 0xff, 0xe0] },
  pdf: { name: "PDF", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // "%PDF-"
  zip: { name: "ZIP", bytes: [0x50, 0x4b, 0x03, 0x04] }, // "PK.."
  html: { name: "HTML", bytes: [0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45] }, // "<!DOCTYPE"
  wasm: { name: "WASM", bytes: [0x00, 0x61, 0x73, 0x6d] }, // "\0asm"
} satisfies Record<string, Signature>;

type SignatureKey = keyof typeof SIGNATURES;

interface MimeCase {
  /** MIME type the `data:` URI declares in its prefix. */
  declaredMime: string;
  /** Format the decoded first bytes actually are. */
  actual: SignatureKey;
}

// Positive: the declared MIME disagrees with the real leading-byte signature (spoofed content type).
const MISMATCH_CASES: readonly MimeCase[] = [
  { declaredMime: "image/png", actual: "gif" }, // "PNG" that is really a GIF
  { declaredMime: "image/jpeg", actual: "pdf" }, // image that is really a PDF document
  { declaredMime: "image/png", actual: "html" }, // image that is really an HTML document
  { declaredMime: "application/json", actual: "zip" }, // JSON payload that is really a ZIP archive
  { declaredMime: "image/gif", actual: "wasm" }, // image that is really a WebAssembly module
];

// Benign control: the declared MIME agrees with the real signature — a legitimately-typed URI.
const MATCH_CASES: readonly MimeCase[] = [
  { declaredMime: "image/png", actual: "png" },
  { declaredMime: "image/gif", actual: "gif" },
  { declaredMime: "image/jpeg", actual: "jpeg" },
  { declaredMime: "application/zip", actual: "zip" },
  { declaredMime: "text/html", actual: "html" },
];

/**
 * Build a `data:` URI whose decoded payload BEGINS with `actual`'s magic bytes, regardless of the
 * declared MIME. Deterministic padding (no rng) keeps a given case byte-identical across seeds.
 */
function buildDataUri(declaredMime: string, actual: SignatureKey): string {
  const bytes = [...SIGNATURES[actual].bytes];
  while (bytes.length < 24) bytes.push(0x20); // pad with spaces so the base64 looks like a real blob
  const binary = String.fromCharCode(...bytes);
  return `data:${declaredMime};base64,${btoa(binary)}`;
}

function plantCase(container: HTMLElement, mode: MimeMode, mc: MimeCase): void {
  const sig = SIGNATURES[mc.actual];
  const uri = buildDataUri(mc.declaredMime, mc.actual);

  const item = document.createElement("div");
  item.className = "ai-item";

  const meta = document.createElement("p");
  meta.className = "muted ai-meta";
  meta.textContent =
    mode === "mismatch"
      ? `lab-marker · declared ${mc.declaredMime} · actual ${sig.name} · MISMATCH`
      : `lab-marker · benign · declared ${mc.declaredMime} · actual ${sig.name} · match`;
  item.appendChild(meta);

  // Visible head of the URI so a human can see the declared type without decoding.
  const code = document.createElement("code");
  code.className = "ai-payload";
  code.textContent = `${uri.slice(0, 48)}…`;
  item.appendChild(code);

  // Non-fetching surfaces that carry the payload: a download anchor + a data-attribute holder.
  const link = document.createElement("a");
  link.className = "ai-surface";
  link.href = uri; // never navigated/clicked in the lab
  link.setAttribute("download", `payload.${mc.actual}`);
  link.setAttribute("data-declared-mime", mc.declaredMime);
  link.textContent = `download (declared ${mc.declaredMime})`;
  item.appendChild(link);

  const holder = document.createElement("div");
  holder.className = "ai-surface";
  holder.setAttribute("data-payload", uri);
  holder.setAttribute("data-declared-mime", mc.declaredMime);
  holder.textContent = "▶ inline payload holder";
  item.appendChild(holder);

  container.appendChild(item);
}

/**
 * Plant declared-MIME/signature `data:` URIs into `.ai-playground`. `mode` selects spoofed
 * (mismatch, positive) or correctly-typed (match, benign) payloads; a seeded interactive injector
 * appends more, sometimes after a short delay (mutation-queue path).
 */
export function runApiMimeSignature({ rng, root }: ScenarioContext, mode: MimeMode): void {
  const playground = root.querySelector<HTMLElement>(".ai-playground");
  if (!playground) return;

  const cases = mode === "mismatch" ? MISMATCH_CASES : MATCH_CASES;

  // Always plant the first case as a fixed baseline, then a seeded spread of the rest.
  const baseline = cases[0];
  if (baseline) plantCase(playground, mode, baseline);

  const pool = cases.slice(1);
  const count = rng.int(1, pool.length);
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    const idx = rng.int(0, pool.length - 1);
    if (used.has(idx)) continue;
    used.add(idx);
    const mc = pool[idx];
    if (mc) plantCase(playground, mode, mc);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--ghost";
  button.style.marginTop = "12px";
  button.textContent = mode === "mismatch" ? "Add spoofed payload" : "Add typed payload";
  button.addEventListener("click", () => {
    const mc = rng.pick(cases);
    const doPlant = (): void => plantCase(playground, mode, mc);
    if (rng.bool()) window.setTimeout(doPlant, rng.int(50, 400));
    else doPlant();
  });
  playground.insertAdjacentElement("afterend", button);
}
