import { useEffect } from 'react'
import lightThemeUrl from 'highlight.js/styles/github.css?url'
import darkThemeUrl from 'highlight.js/styles/github-dark.css?url'

export function useHighlightTheme(isDark: boolean): void {
  useEffect(() => {
    const id = 'hljs-theme'
    let link = document.getElementById(id) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = isDark ? darkThemeUrl : lightThemeUrl
  }, [isDark])
}
