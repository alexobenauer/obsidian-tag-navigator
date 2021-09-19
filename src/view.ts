import { ItemView, WorkspaceLeaf } from "obsidian"
import type { SettingsStore } from "./ui/stores"
import { VIEW_TYPE } from "src/constants"
import TagMenu from "./ui/TagMenu.svelte"

export default class CRNView extends ItemView {
  private tagMenu: TagMenu
  private settingsStore: SettingsStore

  constructor(leaf: WorkspaceLeaf, settingsStore: SettingsStore) {
    super(leaf);
    this.settingsStore = settingsStore
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Cross-reference Navigation";
  }

  getIcon(): string {
    return "go-to-file";
  }

  onClose(): Promise<void> {
    if (this.tagMenu) {
      this.tagMenu.$destroy();
    }
    return Promise.resolve();
  }

  async onOpen(): Promise<void> {
    this.tagMenu = new TagMenu({
      target: this.contentEl,
      props: {
        settingsStore: this.settingsStore
      },
    });
  }
}
