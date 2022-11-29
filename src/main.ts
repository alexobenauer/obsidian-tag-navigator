import { App, Plugin, WorkspaceLeaf } from "obsidian"

import { VIEW_TYPE } from "./constants"
import CRNView from "./view"
import { createSettingsStore, createTagMenuStore } from "./ui/stores"

import type { SettingsStore, TagMenuStore } from "./ui/stores"

declare global {
  interface Window {
    app: App
  }
}

export default class CrossNavPlugin extends Plugin {
  public settingsStore: SettingsStore
  public tagMenuStore: TagMenuStore
  private view: CRNView

  onunload(): void {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE)
      .forEach((leaf) => leaf.detach());
    
    this.tagMenuStore.destroy()
  }

  async onload(): Promise<void> {
    this.settingsStore = await createSettingsStore(this)
    this.tagMenuStore = createTagMenuStore(this.settingsStore)

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => (this.view = new CRNView(leaf, this.settingsStore, this.tagMenuStore))
    )

    this.addCommand({
      id: "show-refnav-view",
      name: "Open Tag Navigator",
      callback: () => {
        const leaf = this.app.workspace.activeLeaf
        leaf.open(new CRNView(leaf, this.settingsStore, this.tagMenuStore))
      },
    })
  }
}
