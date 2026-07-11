/** Global user preferences, persisted in localStorage and applied across pages. */
export interface LabSettings {
  autoFocusTests: boolean;
  showEvaluationPanel: boolean;
  compactSpacing: boolean;
}

export const SETTINGS_KEY = "lab:settings:v1";

export const defaultSettings: LabSettings = {
  autoFocusTests: true,
  showEvaluationPanel: true,
  compactSpacing: false,
};

export function sanitizeSettings(value: Partial<LabSettings>): LabSettings {
  return {
    autoFocusTests: Boolean(value.autoFocusTests),
    showEvaluationPanel: Boolean(value.showEvaluationPanel),
    compactSpacing: Boolean(value.compactSpacing),
  };
}

export function readSettings(): LabSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<LabSettings>) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: LabSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Apply runtime-affecting preferences (side panel visibility, spacing) to the current page. */
export function applyRuntimeSettings(settings: LabSettings): void {
  document.querySelectorAll<HTMLElement>(".app-sidepanel").forEach((panel) => {
    panel.style.display = settings.showEvaluationPanel ? "" : "none";
  });
  document.body.classList.toggle("compact-mode", settings.compactSpacing);
}
