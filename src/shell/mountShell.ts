/**
 * Runtime shell injector. A page ships only its own content in `[data-shell-main]` (and an
 * optional `[data-shell-sidepanel]`); this builds the header / nav / sidepanel / footer chrome
 * around it from a single source. Vanilla DOM by design — no UI framework — so scenario pages
 * stay a neutral, framework-free DOM for the detector under test (see AGENTS.md).
 *
 * Link targets are resolved against `document.body.dataset.root` (e.g. "." for the landing page,
 * "../.." for a page two levels deep), which keeps navigation correct under any static server.
 */

// Imported (not written as a runtime path string) so Vite emits the file and rewrites the URL —
// a hand-built `${root}/assets/...` path exists on the dev server but 404s in the built site.
import logoUrl from "../../assets/icons/tool-icon.png";

interface NavItem {
  module: string;
  path: string;
  i18nKey: string;
}

// Every detection module ships real scenarios; the nav carries no status badges. Module ordering
// follows what the manipulation targets: the human reader first, then an AI agent reading the page.
const NAV_ITEMS: NavItem[] = [
  { module: "home", path: "index.html", i18nKey: "nav.home" },
  { module: "settings", path: "pages/settings/index.html", i18nKey: "nav.settings" },
  { module: "frameworks", path: "pages/frameworks/index.html", i18nKey: "nav.frameworks" },
  { module: "scenarios", path: "pages/scenarios/index.html", i18nKey: "nav.scenarios" },
  {
    module: "visual-manipulation",
    path: "pages/visual-manipulation/index.html",
    i18nKey: "module.visual",
  },
  {
    module: "link-domain-security",
    path: "pages/link-domain-security/index.html",
    i18nKey: "module.link",
  },
  {
    module: "trigger-phrases",
    path: "pages/trigger-phrases/index.html",
    i18nKey: "module.trigger",
  },
  {
    module: "prompt-splitting",
    path: "pages/prompt-splitting/index.html",
    i18nKey: "module.prompt",
  },
  {
    module: "api-interception",
    path: "pages/api-interception/index.html",
    i18nKey: "module.api",
  },
];

function navHtml(root: string, activeModule: string): string {
  return NAV_ITEMS.map((item) => {
    const active = item.module === activeModule ? " is-active" : "";
    return (
      `<a class="module-link${active}" href="${root}/${item.path}" data-module-link="${item.module}">` +
      `<span data-i18n="${item.i18nKey}"></span></a>`
    );
  }).join("");
}

function shellHtml(root: string, navMenu: string): string {
  return `
    <header class="app-header">
      <div class="app-header__content">
        <a class="app-logo" href="${root}/index.html">
          <img src="${logoUrl}" width="28" height="28" alt="Lab icon" />
          <span data-i18n="app.title">Web Security Scenario Lab</span>
        </a>
        <div class="app-controls">
          <div class="control-group">
            <span class="control-label" data-i18n="controls.language">Language</span>
            <div class="segmented" role="group" aria-label="Language">
              <button type="button" data-lang-value="ru" aria-pressed="false">RU</button>
              <button type="button" data-lang-value="en" aria-pressed="true">EN</button>
            </div>
          </div>
          <div class="control-group">
            <span class="control-label" data-i18n="controls.theme">Theme</span>
            <div class="segmented" role="group" aria-label="Theme">
              <button type="button" data-theme-value="light" data-i18n="theme.light" aria-pressed="false"></button>
              <button type="button" data-theme-value="dark" data-i18n="theme.dark" aria-pressed="false"></button>
              <button type="button" data-theme-value="auto" data-i18n="theme.auto" aria-pressed="true"></button>
            </div>
          </div>
          <a class="settings-shortcut" href="${root}/pages/settings/index.html"
             data-i18n-aria-label="nav.settings" data-i18n-title="nav.settings"
             aria-label="Settings" title="Settings">⚙</a>
        </div>
      </div>
    </header>
    <main class="app-frame">
      <aside class="app-nav panel">
        <div class="panel__header"><strong data-i18n="nav.modules">Modules</strong></div>
        <div class="panel__body module-menu">${navMenu}</div>
      </aside>
      <section class="app-main"></section>
      <aside class="app-sidepanel panel"></aside>
    </main>
    <footer class="app-footer">
      <div class="app-footer__content" data-i18n="footer.copyright">Copyright 2026 kroxut</div>
    </footer>`;
}

function defaultSidepanelHtml(): string {
  return `
    <div class="panel__header"><strong data-i18n="evaluation.title">Evaluation Summary</strong></div>
    <div class="panel__body">
      <p class="muted" data-i18n="evaluation.text"></p>
    </div>`;
}

function moveChildren(from: Element, to: Element): void {
  while (from.firstChild) to.appendChild(from.firstChild);
}

/** Build and insert the shell around the current page's content. Call once, before applying i18n. */
export function mountShell(): void {
  const body = document.body;
  const root = body.dataset.root ?? ".";
  const activeModule = body.dataset.module ?? "";

  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = shellHtml(root, navHtml(root, activeModule));

  const mainSlot = shell.querySelector(".app-main");
  const sideSlot = shell.querySelector(".app-sidepanel");
  const mainSource = body.querySelector("[data-shell-main]");
  const sideSource = body.querySelector("[data-shell-sidepanel]");

  if (mainSlot && mainSource) {
    moveChildren(mainSource, mainSlot);
    mainSource.remove();
  }
  if (sideSlot) {
    if (sideSource) {
      moveChildren(sideSource, sideSlot);
      sideSource.remove();
    } else {
      sideSlot.innerHTML = defaultSidepanelHtml();
    }
  }

  body.insertBefore(shell, body.firstChild);
}
