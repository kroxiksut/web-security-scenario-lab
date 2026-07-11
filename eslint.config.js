import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Browser runtime code: engine (TS) and the currently-unused ES-module i18n (JS).
    files: ["src/**/*.{ts,js}"],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ["serve.mjs", "vite.config.ts", "eslint.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
);
