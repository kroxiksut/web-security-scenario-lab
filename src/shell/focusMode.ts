import { t } from "../i18n/index.ts";
import { getLocale } from "./language.ts";
import type { LabSettings } from "./settingsStore.ts";

/**
 * Focus mode strips the shell chrome (header/nav/sidebar/footer) so a scenario renders in
 * isolation for a detector. Forced with `?focus=1`; auto-enabled for test pages when the
 * user's `autoFocusTests` preference is on. Disable with `?focus=0`.
 */
export function setupFocusMode(settings: LabSettings): void {
  const params = new URLSearchParams(window.location.search);
  const isTestPage = document.body.dataset.pageType === "test";
  const focusParam = (params.get("focus") ?? "").toLowerCase();
  const forced = ["1", "true", "yes"].includes(focusParam);
  const disabled = ["0", "false", "no"].includes(focusParam);
  const shouldFocus = forced || (isTestPage && settings.autoFocusTests && !disabled);
  if (!shouldFocus) return;

  document.body.classList.add("focus-mode");

  const exitButton = document.createElement("button");
  exitButton.className = "focus-exit button button--ghost";
  exitButton.type = "button";
  exitButton.dataset.i18n = "focus.exit";
  // The button is created after the page-wide translate pass, and translateDom() only walks
  // descendants of the node it is given — so set the label here or it renders empty.
  exitButton.textContent = t(getLocale(), "focus.exit");
  exitButton.addEventListener("click", () => {
    params.set("focus", "0");
    window.location.search = params.toString();
  });
  document.body.appendChild(exitButton);
}

/** Rewrite `data-test-link` anchors to carry (or drop) `?focus=1` per the user's preference. */
export function setupTestLinks(settings: LabSettings): void {
  document.querySelectorAll<HTMLAnchorElement>("a[data-test-link]").forEach((link) => {
    const url = new URL(link.getAttribute("href") ?? "", window.location.href);
    if (settings.autoFocusTests) url.searchParams.set("focus", "1");
    else url.searchParams.delete("focus");
    link.setAttribute("href", url.pathname + url.search);
  });
}
