import { t } from "../i18n/index.ts";
import { getLocale } from "../shell/language.ts";
import { setupTestLinks } from "../shell/focusMode.ts";
import {
  applyRuntimeSettings,
  defaultSettings,
  readSettings,
  sanitizeSettings,
  saveSettings,
  type LabSettings,
} from "../shell/settingsStore.ts";

/** Wire up the settings form: toggles, save, export/import JSON, reset. */
export function initSettingsPage(): void {
  const form = document.querySelector<HTMLFormElement>("[data-settings-form]");
  if (!form) return;

  const autoFocus = form.querySelector<HTMLInputElement>("#settings-auto-focus");
  const showEval = form.querySelector<HTMLInputElement>("#settings-show-eval");
  const compact = form.querySelector<HTMLInputElement>("#settings-compact");
  const status = form.querySelector<HTMLElement>("[data-settings-status]");
  const exportBtn = form.querySelector<HTMLElement>("[data-settings-export]");
  const importBtn = form.querySelector<HTMLElement>("[data-settings-import]");
  const importInput = form.querySelector<HTMLInputElement>("#settings-import-file");
  const resetBtn = form.querySelector<HTMLElement>("[data-settings-reset]");
  if (!autoFocus || !showEval || !compact || !status) return;

  let settings = readSettings();

  const syncForm = (s: LabSettings): void => {
    autoFocus.checked = s.autoFocusTests;
    showEval.checked = s.showEvaluationPanel;
    compact.checked = s.compactSpacing;
  };

  const showStatus = (key: string, isError: boolean): void => {
    status.hidden = false;
    status.dataset.i18n = key;
    status.textContent = t(getLocale(), key);
    status.classList.toggle("is-error", isError);
  };

  const commit = (next: LabSettings): void => {
    settings = next;
    saveSettings(next);
    applyRuntimeSettings(next);
    setupTestLinks(next);
  };

  syncForm(settings);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    commit(
      sanitizeSettings({
        autoFocusTests: autoFocus.checked,
        showEvaluationPanel: showEval.checked,
        compactSpacing: compact.checked,
      }),
    );
    showStatus("settings.saved", false);
  });

  exportBtn?.addEventListener("click", () => {
    const payload = { version: 1, settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "web-security-lab-settings.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  });

  importBtn?.addEventListener("click", () => importInput?.click());

  importInput?.addEventListener("change", () => {
    const file = importInput.files?.[0];
    if (!file) return;
    void file
      .text()
      .then((text) => {
        const parsed = JSON.parse(text) as {
          settings?: Partial<LabSettings>;
        } & Partial<LabSettings>;
        const candidate = sanitizeSettings(parsed.settings ?? parsed);
        commit(candidate);
        syncForm(candidate);
        showStatus("settings.import_success", false);
      })
      .catch(() => showStatus("settings.import_error", true))
      .finally(() => {
        importInput.value = "";
      });
  });

  resetBtn?.addEventListener("click", () => {
    const next = { ...defaultSettings };
    commit(next);
    syncForm(next);
    showStatus("settings.reset_done", false);
  });
}
