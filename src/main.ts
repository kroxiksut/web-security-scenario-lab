import "./styles/main.css";
import { mountShell } from "./shell/mountShell.ts";
import { applyTheme, bindThemeControls, resolveTheme } from "./shell/theme.ts";
import { applyLanguage, bindLanguageControls, resolveLanguage } from "./shell/language.ts";
import { applyRuntimeSettings, readSettings } from "./shell/settingsStore.ts";
import { setupFocusMode, setupTestLinks } from "./shell/focusMode.ts";
import { initSettingsPage } from "./pages/settings.ts";
import { initScenarioPage } from "./pages/scenario.ts";
import { initFrameworksPage } from "./pages/frameworks.ts";
import { initScenariosPage } from "./pages/scenarios.ts";
import { initModulePage } from "./pages/module.ts";

/**
 * Single entry point for every page. Builds the shell around the page content, then applies
 * cross-cutting concerns (theme, language, settings, focus mode) and any page-specific logic.
 * Replaces the legacy monolithic `src/app.js`.
 */
function boot(): void {
  mountShell();

  applyTheme(resolveTheme());
  applyLanguage(resolveLanguage());
  bindThemeControls();
  bindLanguageControls();

  const settings = readSettings();
  applyRuntimeSettings(settings);
  setupTestLinks(settings);
  setupFocusMode(settings);

  if (document.body.dataset.page === "settings") initSettingsPage();
  if (document.body.dataset.page === "frameworks") initFrameworksPage();
  if (document.body.dataset.page === "scenarios") initScenariosPage();
  if (document.body.dataset.page === "module") initModulePage();
  if (document.body.dataset.scenario) initScenarioPage();
}

boot();
