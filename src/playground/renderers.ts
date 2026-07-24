/**
 * Vanilla renderers — the first framework-agnostic *adapter* for the playground. Each renderer
 * turns one authored {@link Problem} into a concrete DOM node, applying the seeded params the
 * generator produced (this file carries NO randomness). A future React/Vue/… adapter mirrors this
 * shape (same `Problem` in, mounted DOM out) so the technique logic is never rewritten per runtime.
 *
 * DOM here is intentionally allowed to be messy — real malicious pages are. These nodes are NOT
 * unit-tested (testing policy: engine only); their correctness is validated by running PageCheck.
 */

import type { Problem } from "../engine/generateProblems.ts";

type Renderer = (problem: Problem) => HTMLElement;

/** A paragraph carrying the seeded text and a trace marker (detectors key on style, not the marker). */
function textEl(problem: Problem, tag = "p"): HTMLElement {
  const el = document.createElement(tag);
  el.textContent = problem.text;
  el.dataset.labMarker = problem.marker;
  return el;
}

/** Wrap a node in a styled ancestor so ancestor-inherited suppression is exercised too. */
function wrap(child: HTMLElement, apply: (wrapper: HTMLElement) => void): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.dataset.labWrapper = "1";
  apply(wrapper);
  wrapper.appendChild(child);
  return wrapper;
}

const RENDERERS: Record<string, Renderer> = {
  "display-none": (p) => {
    const el = textEl(p);
    if (p.params.wrapper === "ancestor") return wrap(el, (w) => (w.style.display = "none"));
    el.style.display = "none";
    return el;
  },
  "visibility-hidden": (p) => {
    const el = textEl(p);
    if (p.params.wrapper === "ancestor") return wrap(el, (w) => (w.style.visibility = "hidden"));
    el.style.visibility = "hidden";
    return el;
  },
  "opacity-zero": (p) => {
    const el = textEl(p);
    if (p.params.wrapper === "ancestor") return wrap(el, (w) => (w.style.opacity = "0"));
    el.style.opacity = "0";
    return el;
  },
  "low-contrast": (p) => {
    const el = textEl(p);
    // The element carries its own background so the near-match colour pair is the effective one.
    el.style.color = String(p.params.color);
    el.style.backgroundColor = String(p.params.background);
    el.style.display = "inline-block";
    el.style.padding = "2px 6px";
    return el;
  },
  "font-size-zero": (p) => {
    const el = textEl(p);
    el.style.fontSize = `${String(p.params.px)}px`;
    return el;
  },
  "negative-text-indent": (p) => {
    const el = textEl(p);
    el.style.display = "block";
    el.style.textIndent = `${String(p.params.indent)}px`;
    if (p.params.overflowHidden) el.style.overflow = "hidden";
    if (p.params.nowrap) el.style.whiteSpace = "nowrap";
    return el;
  },
  offscreen: (p) => {
    const el = textEl(p);
    el.style.position = "absolute";
    if (p.params.axis === "y") el.style.top = `${String(p.params.offset)}px`;
    else el.style.left = `${String(p.params.offset)}px`;
    return el;
  },
  "benign-sr-only": (p) => {
    // The canonical visually-hidden pattern. Legitimate accessibility helper — the detector is
    // expected to recognise the `sr-only` marker and not treat it as smuggled content.
    const el = textEl(p, "span");
    el.className = "sr-only";
    el.style.position = "absolute";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.padding = "0";
    el.style.margin = "-1px";
    el.style.overflow = "hidden";
    el.style.clip = "rect(0, 0, 0, 0)";
    el.style.whiteSpace = "nowrap";
    el.style.border = "0";
    return el;
  },
  "benign-small-decorative": (p) => {
    // Short decorative label at a small size — below the detector's suspicious-text thresholds.
    const tag = p.params.tag === "sup" ? "sup" : "span";
    const el = textEl(p, tag);
    if (tag !== "sup") el.className = "badge";
    el.style.fontSize = `${String(p.params.px)}px`;
    return el;
  },

  // --- style-obfuscation ---
  clipping: (p) => {
    const el = textEl(p);
    if (p.params.shape === "rect") {
      // Legacy clip needs an absolutely positioned box to take effect.
      el.style.position = "absolute";
      el.style.clip = "rect(0, 0, 0, 0)";
    } else if (p.params.shape === "circle") {
      el.style.clipPath = "circle(0)";
    } else {
      el.style.clipPath = "inset(100%)";
    }
    return el;
  },
  "transform-scale": (p) => {
    const el = textEl(p);
    el.style.display = "inline-block";
    const fn = p.params.fn;
    el.style.transform = fn === "scaleX" ? "scaleX(0)" : fn === "scaleY" ? "scaleY(0)" : "scale(0)";
    return el;
  },
  filter: (p) => {
    const el = textEl(p);
    el.style.display = "inline-block";
    el.style.filter =
      p.params.kind === "brightness"
        ? "brightness(0.05)"
        : p.params.kind === "contrast"
          ? "contrast(0.05)"
          : "blur(6px)";
    return el;
  },
  "aria-hidden": (p) => {
    // Fully visible to a human, but removed from the accessibility / semantic tree.
    const el = textEl(p);
    el.setAttribute("aria-hidden", "true");
    return el;
  },
  "bidi-override": (p) => {
    // A clickable carrier (href is an in-page anchor — never a live host, per the lab's domain rule)
    // whose visible character order is reversed by the bidi override.
    const a = document.createElement("a");
    a.href = "#lab";
    a.textContent = p.text;
    a.dataset.labMarker = p.marker;
    a.style.unicodeBidi = "bidi-override";
    a.style.direction = p.params.dir === "ltr" ? "ltr" : "rtl";
    return a;
  },
  "pseudo-content": (p) => {
    // An empty clickable label whose visible text comes entirely from generated ::before content —
    // which requires a stylesheet rule, so we scope one to this problem's marker.
    const wrapper = document.createElement("span");
    const a = document.createElement("a");
    a.href = "#lab";
    a.dataset.labMarker = p.marker;
    const styleEl = document.createElement("style");
    const content = p.text.replace(/[\\"]/g, "\\$&");
    styleEl.textContent = `a[data-lab-marker="${p.marker}"]::before{content:"${content}"}`;
    wrapper.append(styleEl, a);
    return wrapper;
  },
  "text-security": (p) => {
    const el = textEl(p, "span");
    // Non-standard property — set via setProperty so it applies as an inline style.
    el.style.setProperty("-webkit-text-security", String(p.params.mask));
    return el;
  },

  // --- hidden-input ---
  "hidden-text-input": (p) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = p.text;
    input.dataset.labMarker = p.marker;
    if (p.params.hide === "display-none") input.style.display = "none";
    else offscreen(input);
    return input;
  },
  "hidden-consent": (p) => {
    // A pre-checked, required consent checkbox pushed off-screen so the user never sees or unticks it.
    const label = document.createElement("label");
    label.dataset.labMarker = p.marker;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    input.setAttribute("checked", "");
    input.required = true;
    label.append(input, ` I agree to the terms and privacy policy [${p.marker}]`);
    offscreen(label);
    return label;
  },
  "hidden-editable": (p) => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "true");
    el.textContent = p.text;
    el.dataset.labMarker = p.marker;
    offscreen(el);
    return el;
  },
};

/** Push an element off-screen while keeping it rendered (so geometry-based checks still see it). */
function offscreen(el: HTMLElement): void {
  el.style.position = "absolute";
  el.style.left = "-9999px";
}

/** Every method id this vanilla adapter can render — asserted against the catalog in tests. */
export const RENDERER_METHOD_IDS: readonly string[] = Object.keys(RENDERERS);

/** Build the DOM node for a single problem, or `null` if no renderer exists for its method. */
export function renderProblem(problem: Problem): HTMLElement | null {
  const renderer = RENDERERS[problem.methodId];
  return renderer ? renderer(problem) : null;
}

/** Place every problem into its decoy slot (round-robin if a slot index overflows). */
export function renderProblems(problems: Problem[], slots: HTMLElement[]): void {
  if (slots.length === 0) return;
  for (const problem of problems) {
    const node = renderProblem(problem);
    if (!node) continue;
    const slot = slots[problem.slot % slots.length];
    slot?.appendChild(node);
  }
}
