import { ItemView, WorkspaceLeaf } from "obsidian"
import type { SettingsStore, TagMenuStore } from "./ui/stores"
import { VIEW_TYPE } from "src/constants"
import TagMenu from "./ui/TagMenu.svelte"
import { get } from "svelte/store"

export default class CRNView extends ItemView {
  private tagMenu: TagMenu
  private settingsStore: SettingsStore
  private tagMenuStore: TagMenuStore
  private unsubscribe: () => void

  constructor(leaf: WorkspaceLeaf, settingsStore: SettingsStore, tagMenuStore: TagMenuStore) {
    super(leaf);
    this.settingsStore = settingsStore
    this.tagMenuStore = tagMenuStore
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Tag Navigator";
  }

  getIcon(): string {
    return "go-to-file";
  }

  getEphemeralState(): any {
    const state = get(this.tagMenuStore)
    
    return {
      selectedTags: state.selectedTags,
      expandedGroups: state.expandedGroups
    }
  }

  setEphemeralState(state: any): void {
    if (state) {
      this.tagMenuStore.loadState(state.selectedTags, state.expandedGroups)
    }
  }

  onClose(): Promise<void> {
    if (this.tagMenu) {
      this.tagMenu.$destroy();
    }

    if (this.unsubscribe) {
      this.unsubscribe()
    }

    return Promise.resolve();
  }

  onOpen(): Promise<void> {
    this.tagMenu = new TagMenu({
      target: this.contentEl,
      props: {
        settingsStore: this.settingsStore,
        viewStore: this.tagMenuStore,
      },
    });

    if (this.unsubscribe) {
      this.unsubscribe()
    }

    this.unsubscribe = this.tagMenuStore.subscribe(_ => {
      this.app.workspace.requestSaveLayout()
    })

    return Promise.resolve()
  }  
}
