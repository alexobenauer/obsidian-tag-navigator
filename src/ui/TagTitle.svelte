<script lang="ts">
import { tagParts } from "./utils";


  export let tag: string
  export let inline: boolean = false
  export let strong: boolean = false

  let label: string
  let title: string
  $: recalc(tag)

  function recalc(tag: string) {
    let parts = tagParts(tag)
    label = parts.label
    title = parts.title
  }
</script>

{#if !inline}
  <div class={strong ? "strong" : ""}>
    <p class="small muted">{label ? (label + "/") : ""}</p>
    <p>{title}</p>
  </div>
{:else}
  <p class={strong ? "strong" : ""}>
    <span class="muted">{label ? (label + "/") : ""}</span>{title}
  </p>
{/if}

<style>
  p {
    margin: 0;
  }

  .strong {
    font-weight: bold;
  }

  .small {
    font-size: 12px;
    line-height: 14px;
  }

  .muted {
    opacity: 0.5;
  }
</style>