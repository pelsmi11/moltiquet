import { useEffect, useState } from 'react'
import { useTabsStore } from '@/store/tabs'

/** Restores the previous session's open tabs on mount (re-reading each file
 *  fresh from disk, skipping any that no longer exist) and persists the open
 *  file paths + active tab whenever they change. */
export function useSessionRestore(): void {
  const { tabs, activeId, openFile, setActive } = useTabsStore()
  const [hasRestoredSession, setHasRestoredSession] = useState(false)

  useEffect(() => {
    window.api.getSession().then(async (session) => {
      const files = await Promise.all(session.openFiles.map((path) => window.api.readFile(path)))
      files.forEach((file) => {
        if (file) openFile(file)
      })
      if (session.activeFile && files.some((file) => file?.path === session.activeFile)) {
        setActive(session.activeFile)
      }
      setHasRestoredSession(true)
    })
  }, [openFile, setActive])

  useEffect(() => {
    if (!hasRestoredSession) return
    window.api.setSession({ openFiles: tabs.map((tab) => tab.id), activeFile: activeId })
  }, [tabs, activeId, hasRestoredSession])
}
