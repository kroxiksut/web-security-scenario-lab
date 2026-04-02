(function () {
  const translations = {
    en: {
      "app.title": "Web Security Scenario Lab",
      "app.subtitle": "Static benchmark-lite playground for browser security detectors",
      "controls.language": "Language",
      "controls.theme": "Theme",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "theme.auto": "Auto",
      "nav.modules": "Modules",
      "nav.home": "Home",
      "nav.settings": "Settings",
      "status.mvp": "MVP",
      "status.planned": "Planned",
      "evaluation.title": "Evaluation Summary",
      "evaluation.text": "Expected signal and coverage details appear here for the active scenario.",
      "footer.copyright": "Copyright 2026 kroxut",
      "focus.exit": "Exit test focus",
      "module.visual": "Visual Manipulation",
      "module.link": "Link Domain Security",
      "module.trigger": "Trigger Phrases",
      "module.prompt": "Prompt Splitting",
      "module.api": "API Interception",
      "index.hero": "Controlled scenarios for QA, regression, and detector validation.",
      "index.note": "Use language/theme switchers in the header and open module pages to run scenario tests.",
      "module.placeholder": "Module is planned. Placeholder remains in navigation for forward compatibility.",
      "module.open_test": "Open test page",
      "module.open_catalog": "Open module catalog",
      "settings.title": "Application Settings",
      "settings.description": "Global preferences are stored locally in your browser and applied across module pages.",
      "settings.focus.title": "Test Focus Mode",
      "settings.focus.desc": "When enabled, test pages open in focused mode by default and hide header/menu/sidebar/footer.",
      "settings.focus.query": "You can always force it manually with ?focus=1 in URL.",
      "settings.auto_focus": "Enable auto focus mode for test pages",
      "settings.future.title": "Additional Preferences",
      "settings.future.desc": "These options are included as future-ready toggles for workflow customization.",
      "settings.show_eval": "Show evaluation side panel",
      "settings.compact": "Use compact spacing",
      "settings.manage.title": "Backup and Restore",
      "settings.manage.desc": "Export current preferences, import from JSON, or reset to defaults.",
      "settings.export": "Export settings",
      "settings.import": "Import settings",
      "settings.reset": "Reset to defaults",
      "settings.save": "Save settings",
      "settings.saved": "Settings saved",
      "settings.import_success": "Settings imported",
      "settings.import_error": "Import failed: invalid JSON",
      "settings.reset_done": "Defaults restored"
    },
    ru: {
      "app.title": "Web Security Scenario Lab",
      "app.subtitle": "Статический benchmark-lite стенд для браузерных детекторов",
      "controls.language": "Язык",
      "controls.theme": "Тема",
      "theme.light": "Светлая",
      "theme.dark": "Темная",
      "theme.auto": "Авто",
      "nav.modules": "Модули",
      "nav.home": "Главная",
      "nav.settings": "Настройки",
      "status.mvp": "MVP",
      "status.planned": "Запланировано",
      "evaluation.title": "Сводка оценки",
      "evaluation.text": "Здесь отображаются expected signal и coverage для активного сценария.",
      "footer.copyright": "Copyright 2026 kroxut",
      "focus.exit": "Выйти из test focus",
      "module.visual": "Визуальные манипуляции",
      "module.link": "Безопасность ссылок и доменов",
      "module.trigger": "Триггер-фразы",
      "module.prompt": "Дробление промпта",
      "module.api": "Перехват API",
      "index.hero": "Контролируемые сценарии для QA, regression и валидации детекторов.",
      "index.note": "Используйте переключатели языка/темы в хедере и открывайте страницы модулей для тестов.",
      "module.placeholder": "Модуль запланирован. Заглушка сохранена в меню для forward compatibility.",
      "module.open_test": "Открыть тестовую страницу",
      "module.open_catalog": "Открыть каталог модуля",
      "settings.title": "Настройки приложения",
      "settings.description": "Глобальные параметры сохраняются локально в браузере и применяются на страницах модулей.",
      "settings.focus.title": "Режим Test Focus",
      "settings.focus.desc": "При включении тестовые страницы открываются в focus-режиме по умолчанию и скрывают хедер/меню/сайдбар/футер.",
      "settings.focus.query": "Ручной override всегда доступен через ?focus=1 в URL.",
      "settings.auto_focus": "Включать auto focus mode для тестовых страниц",
      "settings.future.title": "Дополнительные параметры",
      "settings.future.desc": "Эти переключатели добавлены как база для дальнейшей кастомизации workflow.",
      "settings.show_eval": "Показывать evaluation-панель",
      "settings.compact": "Использовать компактные отступы",
      "settings.manage.title": "Бэкап и восстановление",
      "settings.manage.desc": "Экспортируйте текущие настройки, импортируйте JSON или сбросьте к значениям по умолчанию.",
      "settings.export": "Экспорт настроек",
      "settings.import": "Импорт настроек",
      "settings.reset": "Сбросить по умолчанию",
      "settings.save": "Сохранить настройки",
      "settings.saved": "Настройки сохранены",
      "settings.import_success": "Настройки импортированы",
      "settings.import_error": "Ошибка импорта: некорректный JSON",
      "settings.reset_done": "Значения по умолчанию восстановлены"
    }
  };

  const THEME_KEY = "lab:theme";
  const LANG_KEY = "lab:lang";
  const SETTINGS_KEY = "lab:settings:v1";

  const supportedThemes = ["light", "dark", "auto"];
  const supportedLangs = ["en", "ru"];

  const defaultSettings = {
    autoFocusTests: true,
    showEvaluationPanel: true,
    compactSpacing: false
  };

  const root = document.documentElement;
  const params = new URLSearchParams(window.location.search);

  function readSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return { ...defaultSettings };
      }
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    } catch {
      return { ...defaultSettings };
    }
  }

  function sanitizeSettings(value) {
    return {
      autoFocusTests: Boolean(value.autoFocusTests),
      showEvaluationPanel: Boolean(value.showEvaluationPanel),
      compactSpacing: Boolean(value.compactSpacing)
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function resolveTheme() {
    const candidate = (params.get("theme") || localStorage.getItem(THEME_KEY) || "auto").toLowerCase();
    return supportedThemes.includes(candidate) ? candidate : "auto";
  }

  function resolveLang() {
    const candidate = (params.get("lang") || localStorage.getItem(LANG_KEY) || "en").toLowerCase();
    return supportedLangs.includes(candidate) ? candidate : "en";
  }

  function t(lang, key) {
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    document.querySelectorAll("[data-theme-value]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.themeValue === theme ? "true" : "false");
    });
  }

  function applyLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(lang, node.dataset.i18n);
    });

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-lang-value]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.langValue === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(lang, node.dataset.i18nAriaLabel));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", t(lang, node.dataset.i18nTitle));
    });
  }

  function setupNavActive() {
    const currentModule = document.body.dataset.module || "";
    document.querySelectorAll("[data-module-link]").forEach((link) => {
      if (link.dataset.moduleLink === currentModule) {
        link.classList.add("is-active");
      }
    });
  }

  function applyRuntimeSettings(settings) {
    document.querySelectorAll(".app-sidepanel").forEach((panel) => {
      panel.style.display = settings.showEvaluationPanel ? "" : "none";
    });

    document.body.classList.toggle("compact-mode", Boolean(settings.compactSpacing));
  }

  function setupFocusMode(settings) {
    const isTestPage = document.body.dataset.pageType === "test";
    const focusParam = (params.get("focus") || "").toLowerCase();
    const forcedFocus = ["1", "true", "yes"].includes(focusParam);
    const disabledFocus = ["0", "false", "no"].includes(focusParam);
    const shouldFocus = forcedFocus || (isTestPage && settings.autoFocusTests && !disabledFocus);

    if (!shouldFocus) {
      return;
    }

    document.body.classList.add("focus-mode");

    const exitButton = document.createElement("button");
    exitButton.className = "focus-exit button button--ghost";
    exitButton.type = "button";
    exitButton.dataset.i18n = "focus.exit";
    exitButton.addEventListener("click", () => {
      params.set("focus", "0");
      window.location.search = params.toString();
    });

    document.body.appendChild(exitButton);
  }

  function setupTestLinks(settings) {
    document.querySelectorAll("a[data-test-link]").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);

      if (settings.autoFocusTests) {
        url.searchParams.set("focus", "1");
      } else {
        url.searchParams.delete("focus");
      }

      link.setAttribute("href", url.pathname + (url.search ? url.search : ""));
    });
  }

  function setupSettingsPage(state) {
    if (document.body.dataset.page !== "settings") {
      return;
    }

    const form = document.querySelector("[data-settings-form]");
    if (!form) {
      return;
    }

    const autoFocus = form.querySelector("#settings-auto-focus");
    const showEval = form.querySelector("#settings-show-eval");
    const compact = form.querySelector("#settings-compact");
    const status = form.querySelector("[data-settings-status]");
    const exportBtn = form.querySelector("[data-settings-export]");
    const importBtn = form.querySelector("[data-settings-import]");
    const importInput = form.querySelector("#settings-import-file");
    const resetBtn = form.querySelector("[data-settings-reset]");

    function syncForm(settings) {
      autoFocus.checked = Boolean(settings.autoFocusTests);
      showEval.checked = Boolean(settings.showEvaluationPanel);
      compact.checked = Boolean(settings.compactSpacing);
    }

    function showStatus(key, isError) {
      status.hidden = false;
      status.dataset.i18n = key;
      status.textContent = t(state.lang, key);
      status.classList.toggle("is-error", Boolean(isError));
    }

    syncForm(state.settings);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const next = sanitizeSettings({
        autoFocusTests: autoFocus.checked,
        showEvaluationPanel: showEval.checked,
        compactSpacing: compact.checked
      });

      state.settings = next;
      saveSettings(next);
      applyRuntimeSettings(next);
      setupTestLinks(next);
      showStatus("settings.saved", false);
    });

    exportBtn.addEventListener("click", () => {
      const payload = {
        version: 1,
        settings: state.settings
      };

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

    importBtn.addEventListener("click", () => {
      importInput.click();
    });

    importInput.addEventListener("change", async () => {
      const file = importInput.files && importInput.files[0];
      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const candidate = sanitizeSettings(parsed.settings || parsed);

        state.settings = candidate;
        saveSettings(candidate);
        applyRuntimeSettings(candidate);
        setupTestLinks(candidate);
        syncForm(candidate);
        showStatus("settings.import_success", false);
      } catch {
        showStatus("settings.import_error", true);
      } finally {
        importInput.value = "";
      }
    });

    resetBtn.addEventListener("click", () => {
      const next = { ...defaultSettings };
      state.settings = next;
      saveSettings(next);
      applyRuntimeSettings(next);
      setupTestLinks(next);
      syncForm(next);
      showStatus("settings.reset_done", false);
    });
  }

  function normalizeHeaderControls() {
    document.querySelectorAll(".app-controls").forEach((controls) => {
      const shortcut = controls.querySelector(".settings-shortcut");
      if (shortcut && shortcut.parentElement !== controls) {
        controls.appendChild(shortcut);
      }
    });
  }
  function bindControls() {
    document.querySelectorAll("[data-theme-value]").forEach((button) => {
      button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
    });

    document.querySelectorAll("[data-lang-value]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.langValue));
    });
  }

  const state = {
    lang: resolveLang(),
    theme: resolveTheme(),
    settings: readSettings()
  };

  normalizeHeaderControls();
  bindControls();
  setupNavActive();
  applyTheme(state.theme);
  applyLanguage(state.lang);
  applyRuntimeSettings(state.settings);
  setupTestLinks(state.settings);
  setupSettingsPage(state);
  setupFocusMode(state.settings);
})();

