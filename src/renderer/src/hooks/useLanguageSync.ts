import { useEffect } from 'react'
import i18next from 'i18next'

/** Keeps the renderer's i18next language in sync with menu-driven changes
 *  pushed from the main process. */
export function useLanguageSync(): void {
  useEffect(() => {
    return window.api.onLanguageChanged((lng) => {
      i18next.changeLanguage(lng)
    })
  }, [])
}
