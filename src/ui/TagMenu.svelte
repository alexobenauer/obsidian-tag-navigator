<script lang="ts">
  import { TFile, Keymap } from "obsidian";
  import { onMount } from "svelte";
  import type { SettingsStore, TagMenuStore } from "./stores";
  import TagTitle from "./TagTitle.svelte";
  import Star from "./Star.svelte";

  export let settingsStore: SettingsStore
  export let viewStore: TagMenuStore

  const columnWidth = 250
  const columnMargin = 20
  const totalColumnWidth = columnWidth + (columnMargin * 2)
  let clientWidth: number
  $: columns = Math.max(1, Math.trunc(clientWidth / totalColumnWidth))
  $: contentWidth = columns * totalColumnWidth

  async function openFile(e: MouseEvent, file: TFile) {
    let inNewSplit = Keymap.isModEvent(e)
    const mode = (window.app.vault as any).getConfig("defaultViewMode");
    const leaf = inNewSplit
      ? window.app.workspace.splitActiveLeaf()
      : window.app.workspace.getUnpinnedLeaf();
    await leaf.openFile(file, { active : true, mode });
  }

  onMount(() => {
    // Ensures we've loaded everything when presented
    viewStore.selectTags($viewStore.selectedTags)
  })
</script>

<div bind:clientWidth={clientWidth}>
  <div style={"width: " + contentWidth +"px; margin: 0 auto;"}>

    <div class="path">
      <div class="link" on:click={_ => viewStore.selectTags([])}><TagTitle tag="All Tags" /></div>
      
      {#each $viewStore.selectedTags as tag, index}
        <div> › </div>
        <div class="link" on:click={e => Keymap.isModEvent(e) ? viewStore.selectTags([tag]) : viewStore.selectTags($viewStore.selectedTags.slice(0, index + 1))}><TagTitle tag={tag} /></div>
      {/each}

      <p class="muted small" style="margin-left: 10px; align-self: flex-end;">{$viewStore.allMatchingFiles.length} notes</p>
      
      <div style="visibility: hidden;"><TagTitle tag="A/A" /></div><!-- To keep height constant -->
    </div>

    <hr />

    <div class="hscroll">
      <div class="flex align-center">
        <p class="small muted label">Groups:</p>
        <div class="spacer"></div>

        {#each $viewStore.allGroups as label}
          <div style="display: flex; align-items: center;" class={$settingsStore.excludedGroups.includes(label) ? "btn muted" : "btn"} on:click={_ => settingsStore.toggleExcludedGroup(label)}>
            {label}
            <div class={$settingsStore.favoriteGroups.includes(label) ? "star" : "star slideout"} on:click={e => { e.stopPropagation(); settingsStore.toggleFavoriteGroup(label); }}>
              <Star filled={$settingsStore.favoriteGroups.includes(label)} />
            </div>
          </div>
        {/each}
      </div>
      <div class="spacer"></div>
      <div class="flex align-center">
        <p class="small muted label">Tags:</p>
        <div class="spacer"></div>

        {#each $viewStore.allTags as label}
          <div style="display: flex; align-items: center;" class={$settingsStore.excludedTags.includes(label) ? "btn muted" : "btn"} on:click={_ => settingsStore.toggleExcludedTag(label)}>
            {label}
            <div class={$settingsStore.favoriteTags.includes(label) ? "star" : "star slideout"} on:click={e => { e.stopPropagation(); settingsStore.toggleFavoriteTag(label); }}>
              <Star filled={$settingsStore.favoriteTags.includes(label)} />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <hr />

    {#if $viewStore.allMatchingFiles.length > 3}
      {#each $viewStore.groupsSorted as label}
        <div class="flex flex-wrap" style={"margin: 0 -"+columnMargin+"px;"}>
          {#each $viewStore.tagsSorted[label].slice(0, $viewStore.expandedGroups.includes(label) ? $viewStore.tagsSorted[label].length : columns) as tag}
            <div style={"margin: "+columnMargin+"px; width: "+columnWidth+"px;"}>
              <div class="flex align-bottom link" on:click={(_ => viewStore.selectTags([...$viewStore.selectedTags, tag]))}>
                <TagTitle tag={tag} inline={false} strong={true} />
                <div class="flex-spacer"></div>
                <span class="muted strong">{$viewStore.toShow[label][tag].files.length}</span>
              </div>

              {#if $viewStore.toShow[label][tag].files.length > 5}
                <ul>
                  {#each $viewStore.crossrefsSorted[label][tag].slice(0, 5) as tag2}
                    <li class="intersection flex link" on:click={_ => viewStore.selectTags([...$viewStore.selectedTags, tag, tag2])}>
                      <div class="flex small"><TagTitle tag={tag2} inline={true} /></div>
                      <div class="flex-spacer"></div>
                      <span class="muted">{$viewStore.toShow[label][tag].crossrefs[tag2]}</span>
                    </li>
                  {/each}
                </ul>

                <div class="spacer"></div>
              {/if}

              <ul>
                {#each $viewStore.toShow[label][tag].files.slice(0, 5) as file}
                  <li class="small note cutoff link" style={"max-width:"+columnWidth+"px"} on:click={e => openFile(e, file)}>{file.basename}</li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
        {#if $viewStore.tagsSorted[label].length > columns && label.length > 0}
          {#if !$viewStore.expandedGroups.includes(label)}
            <div class="small mutedLink" on:click={_ => viewStore.toggleExpandedGroup(label)}>Show {$viewStore.tagsSorted[label].length - columns} more in {label}</div>
          {:else}
            <div class="small mutedLink" on:click={_ => viewStore.toggleExpandedGroup(label)}>Show less in {label}</div>
          {/if}
        {/if}
        <hr />
      {/each}
    {/if}
    {#if $viewStore.selectedTags.length > 0}
      <strong>All notes</strong>
      <div class="spacer"></div>
      <ul>
        {#each $viewStore.allMatchingFiles as file}
          <li class="note link" on:click={e => openFile(e, file)}>{file.basename}</li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  p {
    margin: 0;
  }

  .path {
    display: flex;
    align-items: flex-end;
  }

  .path > * {
    margin: 0 5px;
  }

  .muted {
    opacity: 0.5;
  }

  .strong {
    font-weight: bold;
  }

  .small {
    font-size: 12px;
  }

  .label {
    white-space: nowrap;
    margin-right: 4px;
  }

  .flex {
    display: flex;
    justify-content: flex-start;
  }

  .align-bottom {
    align-items: flex-end;
  }

  .align-center {
    align-items: center;
    margin: 8px;
    overflow: visible;
    justify-content: flex-start;
    display: flex;
    flex-wrap: wrap; /* have tags wrap instead of scroll, so long tags don't break to a new line */
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .spacer {
    width: 10px;
    height: 10px;
  }

  .flex-spacer {
    flex-grow: 1;
    flex-shrink: 0;
    width: 5px;
  }

  .hscroll {
    max-width: 100%;
    overflow: auto;
  }

  .mutedLink {
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2 ease;
  }

  .mutedLink:hover {
    opacity: 1;
  }

  .link {
    cursor: pointer;

    background: transparent;
    border-radius: 3px;
    transition: all 0.25s ease;

    font-size: 14px;
  }

  .link:hover {
    background: var(--interactive-accent);
    color: var(--text-on-accent);

    padding-left: 4px;
  }

  .small {
    font-size: 13px;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  li.intersection:before {
    content: "+";
    margin-right: 4px;
    opacity: 0.5;
  }

  li.note:before {
    content: "→";
    margin-right: 4px;
  }

  .cutoff {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }


  .btn {
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 8px; /* large/long tags look really weird with circle pills, changed it to be a lil round */
    border: none; /* personal taste with below bg color */
    background: rgba(0, 0, 0, 0.1); /* i have this set to a variable in my theme, background-secondary could be an option */
    font-weight: bold;
    font-size: 12px;
    margin: 2px 2px 2px 2px;
    transition: all 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940);
  }

  .btn.muted {
    border: 1px solid var(--text-on-accent);
    opacity: 0.25;
  }

  .btn:hover {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
  }

  .star {
    width: 14px;
    height: 14px;
    margin-left: 5px;
  }

  .star.slideout {
    position: relative;
    left: -19px;
    margin-right: -19px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease;
  }

  .btn:hover .star.slideout {
    opacity: 1;
    pointer-events: all;
    left: 0px;
    margin-right: 0;
  }
</style>