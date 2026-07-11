import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translateDom } from "../i18n/index.ts";

const LANG_KEY = "lab:lang";
let currentLocale = DEFAULT_LOCALE;

/** The locale applied to the page. Updated by {@link applyLanguage}. */
export function getLocale(): string {
  return currentLocale;
}

/** Resolve the active locale from `?lang=`, then localStorage, defaulting to English. */
export function resolveLanguage(): string {
  const params = new URLSearchParams(window.location.search);
  const candidate = (params.get("lang") ?? localStorage.getItem(LANG_KEY) ?? "").toLowerCase();
  return SUPPORTED_LOCALES.includes(candidate) ? candidate : DEFAULT_LOCALE;
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
