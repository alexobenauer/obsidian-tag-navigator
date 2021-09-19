import { App, Plugin, WorkspaceLeaf } from "obsidian"

import { VIEW_TYPE } from "./constants"
import CRNView from "./view"
import { createSettingsStore, SettingsStore } from "./ui/stores"

declare global {
  interface Window {
    app: App
  }
}

export default class CrossNavPlugin extends Plugin {
  public settingsStore: SettingsStore
  private view: CRNView

  onunload(): void {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE)
      .forEach((leaf) => leaf.detach());
  }

  async onload(): Promise<void> {
    this.settingsStore = await createSettingsStore(this)

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => (this.view = new CRNView(leaf, this.settingsStore))
    )

    this.addCommand({
      id: "show-refnav-view",
      name: "Open Cross-references View",
      callback: () => {
        const leaf = this.app.workspace.activeLeaf
        leaf.open(new CRNView(leaf, this.settingsStore))
      },
    })
  }
}
