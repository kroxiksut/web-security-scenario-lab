<!--
  Svelte 5 hidden-text component (Phase 3 robustness). Compiled by @sveltejs/vite-plugin-svelte into
  Svelte's fine-grained, no-virtual-DOM runtime — a distinct DOM/reactivity signature from React/Vue.
  Script is plain JS (no lang="ts") so the lab needs no svelte-preprocess. `initial` and `makeNode`
  come from the seeded driver; nodes are hidden purely via a Svelte-bound inline `style` string, so
  the detector sees framework-managed suppression. NOT unit-tested (scenario behavior).
-->
<script>
  let { initial = [], makeNode } = $props();
  // Seed once from the prop on mount; it never changes afterwards, so capturing the initial value
  // is intentional (the node list is then driven by `add()`, not by the prop).
  // svelte-ignore state_referenced_locally
  let nodes = $state(initial);

  function add() {
    nodes = [...nodes, makeNode()];
  }
</script>

<div class="svelte-hidden-root">
  <p>Svelte-managed baseline visible text.</p>
  {#each nodes as node, i (i)}
    <p style={node.style}>{node.text}</p>
  {/each}
  <button type="button" class="button button--ghost" style="margin-top: 12px" onclick={add}>
    Inject hidden node (Svelte)
  </button>
</div>
