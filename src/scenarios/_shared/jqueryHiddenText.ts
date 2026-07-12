import type { ScenarioContext } from "../context.ts";

/**
 * Shared jQuery-driven hidden-text behavior, parameterized by the jQuery instance so the SAME
 * driver runs on multiple pinned versions (3.7, legacy 1.12, …). Library version is a coverage
 * dimension (AGENTS.md): the code is identical, only the runtime differs, so the detector is
 * exercised against each version's DOM/animation signature. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed via jQuery hide()",
  "hidden note (test): jQuery css(opacity) suppressed this line",
  "off-screen smuggled text, positioned by jQuery",
  "clipped instruction placeholder injected by jQuery",
];

// Each technique hides a node through jQuery's API rather than direct DOM style writes, so the
// detector sees framework-managed suppression. `hide()` sets display:none; the rest go via css().
const TECHNIQUES = ["hide", "opacity", "offscreen", "clip"] as const;
type Technique = (typeof TECHNIQUES)[number];

function applyTechnique(node: JQuery<HTMLElement>, technique: Technique): void {
  switch (technique) {
    case "hide":
      node.hide();
      break;
    case "opacity":
      node.css("opacity", "0.02");
      break;
    case "offscreen":
      node.css({ position: "absolute", left: "-9999px" });
      break;
    case "clip":
      node.css({ position: "absolute", clip: "rect(0, 0, 0, 0)" });
      break;
  }
}

/**
 * Reproduce the hidden-content scenario through a jQuery-managed DOM. Seeded via `ctx.rng`, so a
 * given `?seed=` reproduces the same content across reloads (and across framework versions).
 */
export function runJqueryHiddenText($: JQueryStatic, { rng, root }: ScenarioContext): void {
  const playground = $<HTMLElement>(".vm-playground", root);
  if (playground.length === 0) return;

  // Seed the pre-existing hidden nodes with rotating suspicious text, suppressed via jQuery.
  playground.find(".vm-hidden-opacity").text(rng.pick(HIDDEN_SNIPPETS)).css("opacity", "0.02");
  playground
    .find(".vm-offscreen")
    .text(rng.pick(HIDDEN_SNIPPETS))
    .css({ position: "absolute", left: "-9999px" });
  playground
    .find(".vm-clipped")
    .text(rng.pick(HIDDEN_SNIPPETS))
    .css({ position: "absolute", clip: "rect(0, 0, 0, 0)" });

  const button = $("<button>", {
    type: "button",
    class: "button button--ghost",
    text: "Inject hidden node (jQuery)",
  }).css("margin-top", "12px");

  button.on("click", () => {
    const node = $("<p>", { text: rng.pick(HIDDEN_SNIPPETS) });
    const delay = rng.int(0, 500);
    // Sometimes a timed jQuery animation that settles into a near-invisible state, sometimes an
    // immediate static suppression — the same event-driven, timed DOM mutation the detector must
    // survive, now driven entirely through jQuery's queue/animation machinery.
    if (rng.bool()) node.css("opacity", "1").appendTo(playground).delay(delay).fadeTo(200, 0.02);
    else applyTechnique(node.appendTo(playground), rng.pick(TECHNIQUES));
  });

  playground.after(button);
}
