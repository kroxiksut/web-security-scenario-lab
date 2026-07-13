/**
 * Type declarations for npm-aliased framework versions (see AGENTS.md multi-version policy).
 * An alias like `jquery1@npm:jquery@1.12.4` is a distinct module specifier with no bundled types,
 * so we map each alias onto the real package's global types. `JQueryStatic` is a global from
 * `@types/jquery`; the alias just re-exposes it as a default export.
 */
declare module "jquery1" {
  const jquery: JQueryStatic;
  export default jquery;
}

// Multi-version React aliases (resolved to version-isolated nested installs by Vite; see
// vite.config.ts and AI_CONTEXT.md). Types are shared from `@types/react`/`@types/react-dom` —
// our tiny surface (createElement/useState/render/createRoot) is stable across React 17–19.
declare module "react17" {
  import React = require("react");
  export = React;
}
declare module "react-dom17" {
  import ReactDOM = require("react-dom");
  export = ReactDOM;
}
declare module "react19" {
  import React = require("react");
  export = React;
}
declare module "react-dom19/client" {
  export * from "react-dom/client";
}

// Legacy Alpine 2.x alias (`alpine2@npm:alpinejs@2.8.2`). The Alpine 2 dist ships no bundled types and
// `@types/alpinejs` targets v3, so declare the minimal surface used: the module is imported for its
// start-on-load side effect, and its default is the Alpine global (start()/window assignment done by
// the dist itself). `lit2`/`htmx1` aliases resolve their own bundled types, so they need no declaration.
declare module "alpine2" {
  const Alpine: { start(): void };
  export default Alpine;
}
