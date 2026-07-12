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
  {
    // Ambient declarations for npm-aliased framework versions re-export CommonJS-typed packages
    // (`import X = require("react"); export = X`), the only form that preserves the real types
    // through an alias specifier. Allow that idiom in declaration files.
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
