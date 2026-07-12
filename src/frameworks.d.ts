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
