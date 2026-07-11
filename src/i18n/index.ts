import en from "./locales/en.json";
import ru from "./locales/ru.json";

/**
 * Single source of truth for UI translations. Retires the duplicate inline dictionary that
 * used to live in the legacy `src/app.js`. Both languages are first-class (see AGENTS.md).
 */
const dictionaries: Record<string, Record<string, string>> = { en, ru };

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = Object.keys(dictionaries);

/** Look up a key for a locale, falling back to English, then the raw key. */
export function t(locale: string, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE]?.[key] ?? key;
}

/**
 * Apply translations to a DOM subtree using data attributes:
 * `data-i18n` (textContent), `data-i18n-aria-label`, `data-i18n-title`.
 * Also stamps `<html lang>`.
 */
export function translateDom(locale: string, root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((node) => {
    node.textContent = t(locale, node.dataset.i18n ?? "");
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(locale, node.dataset.i18nAriaLabel ?? ""));
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(locale, node.dataset.i18nTitle ?? ""));
  });
  if (root === document) document.documentElement.setAttribute("lang", locale);
}
