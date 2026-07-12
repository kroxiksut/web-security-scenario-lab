/**
 * Ambient declaration so TypeScript can resolve `*.svelte` imports (the actual compilation is done by
 * @sveltejs/vite-plugin-svelte at build time). Kept minimal: components are typed as the generic
 * Svelte `Component`, which is all the driver needs to call `mount()`.
 */
declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component;
  export default component;
}
