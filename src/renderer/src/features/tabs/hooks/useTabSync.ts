import { useEffect } from 'react'
import { useTabsStore } from '@/store/tabs'

interface TabSync {
  openFile: () => Promise<void>
}

/** Bridges the tab store to the main process: opens files via the OS dialog,
 *  reacts to files pushed from main (file association / dialog), and closes the
 *  active tab when the Close-Tab menu command fires. */
export function useTabSync(): TabSync {
  const { activeId, openFile, closeTab } = useTabsStore()

  useEffect(() => {
    return window.api.onFileOpened((file) => {
      openFile(file)
    })
  }, [openFile])

  useEffect(() => {
    return window.api.onTabClose(() => {
      if (activeId) closeTab(activeId)
    })
  }, [activeId, closeTab])

  const openFileDialog = async (): Promise<void> => {
    const file = await window.api.openFileDialog()
    if (file) openFile(file)
  }

  return { openFile: openFileDialog }
}
