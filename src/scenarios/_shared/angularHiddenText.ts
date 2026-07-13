import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  AngularHiddenText,
  HIDDEN_TEXT_CONFIG,
  type HiddenNode,
} from "./angularHiddenText.component";
import type { ScenarioContext } from "../context.ts";

/**
 * Shared Angular hidden-text behavior (Phase 3 robustness). Bootstraps the AOT-compiled standalone
 * component into a host element via `bootstrapApplication`, providing the seeded config through a DI
 * token (bootstrap takes no @Inputs). Runs zoneless (`provideZonelessChangeDetection`) so no zone.js
 * global patch is installed — change detection flows through the component's signals. Angular's Ivy
 * runtime is a distinct DOM/change-detection signature (decorator + DI + zoneless signals) the detector
 * must survive. NOT unit-tested (scenario behavior).
 */

// Simulated "smuggled" text. Clearly lab markers — suspicious-looking but harmless test content.
const HIDDEN_SNIPPETS = [
  "lab-marker: suppressed inside an Angular change-detection subtree",
  "hidden note (test): Angular [style] binding set opacity ~0",
  "off-screen smuggled text rendered by Angular",
  "clipped instruction placeholder in Angular output",
];

// Each style hides a node purely via an Angular-bound inline style string (framework-managed).
const HIDDEN_STYLES = [
  "opacity:0.02",
  "position:absolute;left:-9999px",
  "font-size:0.1px",
  "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0, 0, 0, 0)",
];

export function runAngularHiddenText({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const makeNode = (): HiddenNode => ({
    text: rng.pick(HIDDEN_SNIPPETS),
    style: rng.pick(HIDDEN_STYLES),
  });
  const initial: HiddenNode[] = Array.from({ length: 3 }, makeNode);

  // bootstrapApplication mounts onto the element matching the component selector.
  const host = document.createElement("lab-hidden-text-angular");
  playground.appendChild(host);

  void bootstrapApplication(AngularHiddenText, {
    providers: [
      provideZonelessChangeDetection(),
      { provide: HIDDEN_TEXT_CONFIG, useValue: { initial, makeNode } },
    ],
  }).catch((err: unknown) => {
    console.error("[scenario] Angular bootstrap failed", err);
  });
}
