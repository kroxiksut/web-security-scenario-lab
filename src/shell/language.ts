import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translateDom } from "../i18n/index.ts";

const LANG_KEY = "lab:lang";
let currentLocale = DEFAULT_LOCALE;

/** The locale applied to the page. Updated by {@link applyLanguage}. */
export function getLocale(): string {
  return currentLocale;
}

/**
 * First supported locale the browser asks for. `navigator.languages` is ordered by preference and
 * carries region tags (`ru-RU`, `en-GB`), so match on the primary subtag.
 */
function browserLocale(): string | null {
  const requested = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of requested) {
    const base = (tag ?? "").toLowerCase().split("-")[0] ?? "";
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return null;
}

/**
 * Resolve the active locale, most explicit signal first: `?lang=` (a deep link states its language),
 * then the visitor's stored choice, then what the browser asks for, and English as the last resort.
 */
export function resolveLanguage(): string {
  const params = new URLSearchParams(window.location.search);
  const explicit = (params.get("lang") ?? localStorage.getItem(LANG_KEY) ?? "").toLowerCase();
  if (SUPPORTED_LOCALES.includes(explicit)) return explicit;
  return browserLocale() ?? DEFAULT_LOCALE;
}

/** Apply and persist a locale: translate the DOM and update language button pressed state. */
export function applyLanguage(locale: string): void {
  currentLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  localStorage.setItem(LANG_KEY, currentLocale);
  translateDom(currentLocale);
  document.querySelectorAll<HTMLElement>("[data-lang-value]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.langValue === currentLocale ? "true" : "false",
    );
  });
  // Notify dynamic content (e.g. the scenario evaluation panel) to re-render for the new locale.
  document.dispatchEvent(
    new CustomEvent("lab:localechange", { detail: { locale: currentLocale } }),
  );
}

export function bindLanguageControls(): void {
  document.querySelectorAll<HTMLElement>("[data-lang-value]").forEach((button) => {
    button.addEventListener("click", () =>
      applyLanguage(button.dataset.langValue ?? DEFAULT_LOCALE),
    );
  });
}
