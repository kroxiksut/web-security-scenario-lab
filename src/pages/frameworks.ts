import matrixData from "../../data/frameworks.json";
import type { FrameworkMatrix } from "../engine/types.ts";
import { localize } from "../engine/resolveEvaluation.ts";
import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";

// The matrix is schema-validated at build/test time (tests/unit/frameworks.test.ts); the runtime
// trusts it (Ajv is not bundled), matching how scenario manifests are handled.
const matrix = matrixData as FrameworkMatrix;

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);
}

function summaryLine(locale: string): string {
  const libs = matrix.frameworks.length;
  const versions = matrix.frameworks.reduce((n, f) => n + f.versions.length, 0);
  const pages = matrix.frameworks.reduce(
    (n, f) => n + f.versions.reduce((m, v) => m + v.scenarios.length, 0),
    0,
  );
  return `${libs} / ${versions} / ${pages} — ${esc(t(locale, "frameworks.summary"))}`;
}

function frameworkTable(
  framework: FrameworkMatrix["frameworks"][number],
  locale: string,
  rootPath: string,
): string {
  const kind = t(locale, `frameworks.kind.${framework.kind}`);
  const rows = framework.versions
    .map((v) => {
      const links = v.scenarios
        .map((ref) => {
          const href = `${rootPath}/${ref.page}`;
          return `<a href="${esc(href)}" data-test-link="true"><code>${esc(ref.id)}</code></a>`;
        })
        .join("<br />");
      return `
        <tr>
          <td><strong>${esc(v.version)}</strong></td>
          <td>${esc(v.releaseDate)}</td>
          <td><code>${esc(v.alias)}</code></td>
          <td>${links}</td>
          <td class="fw-why">${esc(localize(v.whyIncluded, locale))}</td>
        </tr>`;
    })
    .join("");

  return `
    <section class="fw-group">
      <h2 class="fw-group__title">
        ${esc(framework.name)} <span class="badge">${esc(kind)}</span>
      </h2>
      <div class="fw-table-wrap">
        <table class="fw-table">
          <thead>
            <tr>
              <th>${esc(t(locale, "frameworks.col.version"))}</th>
              <th>${esc(t(locale, "frameworks.col.released"))}</th>
              <th>${esc(t(locale, "frameworks.col.alias"))}</th>
              <th>${esc(t(locale, "frameworks.col.scenarios"))}</th>
              <th>${esc(t(locale, "frameworks.col.why"))}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function render(locale: string): void {
  const host = document.querySelector<HTMLElement>("[data-frameworks-table]");
  if (!host) return;
  const rootPath = document.body.dataset.root ?? ".";
  host.innerHTML = `
    <p class="muted fw-summary">${summaryLine(locale)}</p>
    ${matrix.frameworks.map((f) => frameworkTable(f, locale, rootPath)).join("")}`;
}

/** Render the framework coverage matrix from `data/frameworks.json`; re-render on locale change. */
export function initFrameworksPage(): void {
  render(getLocale());
  document.addEventListener("lab:localechange", () => render(getLocale()));
}
