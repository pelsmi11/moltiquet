import { useEffect, useState } from 'react'

interface Theme {
  isDark: boolean
  toggleTheme: () => void
}

/** Owns the light/dark theme: loads the persisted value, syncs the `dark`
 *  class on <html>, listens for menu-driven changes, and exposes a toggle. */
export function useTheme(): Theme {
  const [isDark, setIsDark] = useState(false)

  const applyTheme = (dark: boolean): void => {
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }

  useEffect(() => {
    window.api.getTheme().then((theme) => applyTheme(theme === 'dark'))
  }, [])

  useEffect(() => {
    return window.api.onThemeChanged((theme) => applyTheme(theme === 'dark'))
  }, [])

  const toggleTheme = (): void => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      window.api.setTheme(next ? 'dark' : 'light')
      return next
    })
  }

  return { isDark, toggleTheme }
}
