import en from "./locales/en.json";
import ru from "./locales/ru.json";

const dictionaries = { en, ru };

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = Object.keys(dictionaries);

export function resolveLocale(search = window.location.search) {
  const params = new URLSearchParams(search);
  const candidate = (params.get("lang") || localStorage.getItem("lab:lang") || "").toLowerCase();

  if (SUPPORTED_LOCALES.includes(candidate)) {
    return candidate;
  }

  return DEFAULT_LOCALE;
}

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return DEFAULT_LOCALE;
  }

  localStorage.setItem("lab:lang", locale);
  return locale;
}

export function t(locale, key) {
  const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  return dict[key] || dictionaries[DEFAULT_LOCALE][key] || key;
}
