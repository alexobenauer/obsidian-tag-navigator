import { getAllTags, Plugin, TFile } from "obsidian";
import { get, writable } from "svelte/store";
import { tagParts } from "./utils";

import type { Readable } from "svelte/store";

export interface StoredSettings {
  excludedGroups: string[],
  excludedTags: string[],
  favoriteGroups: string[],
  favoriteTags: string[]
}

export const defaultSettings: StoredSettings = {
  excludedGroups: [],
  excludedTags: [],
  favoriteGroups: ["status", "activity", "type"],
  favoriteTags: []
}

export interface SettingsStore extends Readable<StoredSettings> {
  toggleExcludedGroup(group: string): void
  toggleExcludedTag(tag: string): void
  toggleFavoriteGroup(group: string): void
  toggleFavoriteTag(tag: string): void
}

export async function createSettingsStore(
  plugin: Plugin
): Promise<SettingsStore> {
  const initialData = await plugin.loadData()
  const { subscribe, update } = writable<StoredSettings>({ ...defaultSettings, ...initialData });

  function toggleExcludedGroup(group: string) {
    update(settings => {
      const excludedGroups = settings.excludedGroups

      const index = excludedGroups.indexOf(group)

      if (index > -1) {
        excludedGroups.splice(index, 1)
      }
      else {
        excludedGroups.push(group)
      }

      const newState = {
        ...settings,
        excludedGroups
      }

      plugin.saveData(newState)
      return newState
    })
  }

  function toggleExcludedTag(tag: string) {
    update(settings => {
      const excludedTags = settings.excludedTags

      const index = excludedTags.indexOf(tag)

      if (index > -1) {
        excludedTags.splice(index, 1)
      }
      else {
        excludedTags.push(tag)
      }

      const newState = {
        ...settings,
        excludedTags
      }

      plugin.saveData(newState)
      return newState
    })
  }

  function toggleFavoriteGroup(group: string) {
    update(settings => {
      const favoriteGroups = settings.favoriteGroups

      const index = favoriteGroups.indexOf(group)

      if (index > -1) {
        favoriteGroups.splice(index, 1)
      }
      else {
        favoriteGroups.push(group)
      }

      const newState = {
        ...settings,
        favoriteGroups
      }

      plugin.saveData(newState)
      return newState
    })
  }

  function toggleFavoriteTag(tag: string) {
    update(settings => {
      const favoriteTags = settings.favoriteTags

      const index = favoriteTags.indexOf(tag)

      if (index > -1) {
        favoriteTags.splice(index, 1)
      }
      else {
        favoriteTags.push(tag)
      }

      const newState = {
        ...settings,
        favoriteTags
      }

      plugin.saveData(newState)
      return newState
    })
  }

  return {
    subscribe,
    toggleExcludedGroup,
    toggleExcludedTag,
    toggleFavoriteGroup,
    toggleFavoriteTag
  };
}

export interface TagMenuState {
  allGroups: string[],
  allTags: string[],
  toShow: {
    [group: string]: {
      [tag: string]: {
        displayName: string,
        files: TFile[],
        crossrefs: { [tag: string]: number }
      }
    }
  },
  groupsSorted: string[],
  tagsSorted: { [group: string]: string[] },
  crossrefsSorted: { [group: string]: { [tag: string]: string[] } }
  allMatchingFiles: TFile[],
  selectedTags: string[],
  expandedGroups: string[]
}

function generateInitialTagMenuState(): TagMenuState {
  return {
    allGroups: [],
    allTags: [],
    toShow: {},
    groupsSorted: [],
    tagsSorted: {},
    crossrefsSorted: {},
    allMatchingFiles: [],
    selectedTags: [],
    expandedGroups: [""] // always expand ungrouped tags section
  }
}

export interface TagMenuStore extends Readable<TagMenuState> {
  selectTags(selectTags: string[]): void
  toggleExpandedGroup(group: string): void
  destroy(): void
  loadState(selectedTags: string[], expandedGroups: string[]): void
}

export function createTagMenuStore(
  settingsStore: SettingsStore
): TagMenuStore {
  const { subscribe, set, update } = writable<TagMenuState>(generateInitialTagMenuState());

  function selectTags(selectTags: string[]) {
    const newState = generateInitialTagMenuState()
    newState.selectedTags = selectTags

    const groupCounts: { [group: string]: number } = {}
    const tagCounts: { [group: string]: { [tag: string]: number } } = {}

    const settingsState = get(settingsStore)

    const allFiles = window.app.vault.getMarkdownFiles()
    const allFileTags: { [fname: string]: string[] } = {}
    allFiles.forEach(file => {
      const fileTags = getAllTags(window.app.metadataCache.getFileCache(file))
      allFileTags[file.name] = fileTags
      if (selectTags.every(t => fileTags.includes(t))) {
        newState.allMatchingFiles.push(file)

        fileTags.forEach(tag => {
          if (selectTags.includes(tag)) { return }

          const parts = tagParts(tag)
          const label = parts.label || ""
          const title = parts.title

          if (label.length > 0 && !newState.allGroups.includes(label)) {
            newState.allGroups.push(label)
          }

          if (label.length < 1 && !newState.allTags.includes(tag)) {
            newState.allTags.push(tag)
          }

          if (settingsState.excludedGroups.includes(label)) { return }
          if (settingsState.excludedTags.includes(tag)) { return }

          if (!newState.toShow[label]) {
            newState.toShow[label] = {}
          }

          if (!newState.toShow[label][tag]) {
            newState.toShow[label][tag] = { displayName: title, files: [], crossrefs: {} }
          }

          newState.toShow[label][tag].files.push(file)

          if (!tagCounts[label]) { tagCounts[label] = {} }

          groupCounts[label] = (groupCounts[label] || 0) + 1
          tagCounts[label][tag] = (tagCounts[label][tag] || 0) + 1
        })
      }
    })

    newState.allGroups.sort()
    newState.allTags.sort()

    // Generate groupsSorted
    newState.groupsSorted = Object.keys(newState.toShow).sort((a, b) => (groupCounts[b] + Object.keys(tagCounts[b] || {}).length) - (groupCounts[a] + Object.keys(tagCounts[a] || {}).length)) // tagCounts included to prioritize groups that have more columns

    const _favoriteGroups = settingsState.favoriteGroups.sort((a, b) => ((groupCounts[a] || 0) + Object.keys(tagCounts[a] || {}).length) - ((groupCounts[b] || 0)) + Object.keys(tagCounts[b] || {}).length)
    _favoriteGroups.forEach(group => {
      const index = newState.groupsSorted.indexOf(group)

      if (index > -1) {
        newState.groupsSorted.splice(index, 1);
        newState.groupsSorted.unshift(group);
      }
    })

    // Put list of all ungrouped tags at bottom, it will always be expanded
    const index = newState.groupsSorted.indexOf("")
    if (index > -1) {
      newState.groupsSorted.splice(index, 1);
      newState.groupsSorted.push("");
    }

    // Put list of favorite tags at top
    if (settingsState.favoriteTags.length > 0 && newState.toShow[""]) {
      newState.groupsSorted.unshift("favorite tags")
      newState.toShow["favorite tags"] = {}
      tagCounts["favorite tags"] = {}

      settingsState.favoriteTags.forEach(tag => {
        if (newState.toShow[""][tag]) {
          newState.toShow["favorite tags"][tag] = newState.toShow[""][tag]
          delete newState.toShow[""][tag]

          tagCounts["favorite tags"][tag] = tagCounts[""][tag]
          delete tagCounts[""][tag]
        }
      })
    }

    // Generate tagsSorted, crossrefs
    Object.keys(newState.toShow).forEach(group => {
      newState.tagsSorted[group] = Object.keys(newState.toShow[group]).sort((a, b) => tagCounts[group][b] - tagCounts[group][a])

      Object.keys(newState.toShow[group]).forEach(tag => {
        const files = newState.toShow[group][tag].files
        const crossrefs: { [index: string]: number } = {}
        files.forEach(file => {
          allFileTags[file.name].forEach(tag2 => {
            if (tag2 === tag) { return }
            if (selectTags.includes(tag2)) { return }
            crossrefs[tag2] = (crossrefs[tag2] || 0) + 1
          })
        })
        newState.toShow[group][tag].crossrefs = crossrefs
      })
    })

    // Generate crossrefsSorted
    Object.keys(newState.toShow).forEach(group => {
      newState.crossrefsSorted[group] = {}
      Object.keys(newState.toShow[group]).forEach(tag => {
        const crossrefs = newState.toShow[group][tag].crossrefs
        const sorted = Object.keys(crossrefs).sort((a, b) => crossrefs[b] - crossrefs[a])

        sorted.slice().reverse().forEach(tag => {
          if (settingsState.favoriteTags.find(ftag => tag === ftag)
            || settingsState.favoriteGroups.find(fgroup => tag.startsWith("#" + fgroup))) {
            sorted.splice(sorted.indexOf(tag), 1);
            sorted.unshift(tag);
          }
        })

        newState.crossrefsSorted[group][tag] = sorted
      })
    })

    set(newState)
  }

  function toggleExpandedGroup(group: string) {
    update(state => {
      const expandedGroups = state.expandedGroups

      const index = expandedGroups.indexOf(group)

      if (index > -1) {
        expandedGroups.splice(index, 1)
      }
      else {
        expandedGroups.push(group)
      }

      return {
        ...state,
        expandedGroups
      }
    })
  }

  function loadState(selectedTags: string[], expandedGroups: string[]) {
    if (selectedTags) {
      selectTags(selectedTags)
    }

    if (expandedGroups) {
      update(state => ({
        ...state,
        expandedGroups
      }))
    }
  }

  const unsubscribe = settingsStore.subscribe(_ => {
    selectTags(get({ subscribe }).selectedTags)
  })
  const destroy = unsubscribe

  return { subscribe, destroy, loadState, selectTags, toggleExpandedGroup }
}