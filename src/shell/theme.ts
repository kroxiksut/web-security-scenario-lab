const THEME_KEY = "lab:theme";
const SUPPORTED_THEMES = ["light", "dark", "auto"] as const;
export type Theme = (typeof SUPPORTED_THEMES)[number];

function isTheme(value: string): value is Theme {
  return (SUPPORTED_THEMES as readonly string[]).includes(value);
}

/** Resolve the active theme from `?theme=`, then localStorage, defaulting to `auto`. */
export function resolveTheme(): Theme {
  const params = new URLSearchParams(window.location.search);
  const candidate = (
    params.get("theme") ??
    localStorage.getItem(THEME_KEY) ??
    "auto"
  ).toLowerCase();
  return isTheme(candidate) ? candidate : "auto";
}

/** Apply and persist a theme, updating the pressed state of theme buttons. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll<HTMLElement>("[data-theme-value]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.themeValue === theme ? "true" : "false");
  });
}

export function bindThemeControls(): void {
  document.querySelectorAll<HTMLElement>("[data-theme-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.themeValue ?? "auto";
      if (isTheme(value)) applyTheme(value);
    });
  });
}
