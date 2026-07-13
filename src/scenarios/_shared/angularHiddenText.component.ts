import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  signal,
} from "@angular/core";

/**
 * Angular hidden-text component (Phase 3 robustness). Authored with a decorator + inline template and
 * compiled ahead-of-time (AOT) by @analogjs/vite-plugin-angular into Angular's Ivy runtime. This is the
 * lab's heaviest framework runtime and its only decorator-based, dependency-injected component model.
 * The suppressed nodes are authored by the component and hidden via an Angular `[style]` string binding,
 * so the detector sees framework-managed suppression driven by change detection. Runs zoneless: change
 * detection is signal-driven (no zone.js monkeypatch), so nothing global leaks onto the page. This file
 * is the ONLY Angular-decorated source; the plugin is scoped (via `tsconfig.angular.json` + a transform
 * filter) so no other scenario is Angular-compiled. NOT unit-tested (scenario behavior).
 */

export interface HiddenNode {
  text: string;
  style: string;
}

export interface HiddenTextConfig {
  initial: HiddenNode[];
  makeNode: () => HiddenNode;
}

/** DI token carrying the seeded config into the bootstrapped component (bootstrap has no @Inputs). */
export const HIDDEN_TEXT_CONFIG = new InjectionToken<HiddenTextConfig>("lab.hiddenTextConfig");

@Component({
  selector: "lab-hidden-text-angular",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="angular-hidden-root">
      <p>Angular-managed baseline visible text.</p>
      @for (node of nodes(); track $index) {
        <p [style]="node.style">{{ node.text }}</p>
      }
      <button
        type="button"
        class="button button--ghost"
        style="margin-top: 12px"
        (click)="addNode()"
      >
        Inject hidden node (Angular)
      </button>
    </div>
  `,
})
export class AngularHiddenText {
  private readonly config = inject(HIDDEN_TEXT_CONFIG);
  readonly nodes = signal<HiddenNode[]>(this.config.initial);

  addNode(): void {
    this.nodes.update((prev) => [...prev, this.config.makeNode()]);
  }
}
