import { create } from 'zustand'
import type { OpenedFile } from '@shared/ipc'

export interface Tab {
  id: string // = file path
  name: string
  content: string
}

interface TabsState {
  tabs: Tab[]
  activeId: string | null
  openFile: (file: OpenedFile) => void
  closeTab: (id: string) => void
  setActive: (id: string) => void
}

export const useTabsStore = create<TabsState>((set) => ({
  tabs: [],
  activeId: null,

  openFile: (file) =>
    set((state) => {
      const existing = state.tabs.find((t) => t.id === file.path)
      if (existing) return { activeId: existing.id }
      const tab: Tab = { id: file.path, name: file.name, content: file.content }
      return { tabs: [...state.tabs, tab], activeId: tab.id }
    }),

  closeTab: (id) =>
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === id)
      if (idx === -1) return state
      const next = state.tabs.filter((t) => t.id !== id)
      let activeId = state.activeId
      if (activeId === id) {
        activeId = next[idx]?.id ?? next[idx - 1]?.id ?? null
      }
      return { tabs: next, activeId }
    }),

  setActive: (id) => set({ activeId: id })
}))
