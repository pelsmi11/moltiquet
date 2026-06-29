import type { SetLanguageResult, OpenedFile, GetThemeResult } from '@shared/ipc'

declare global {
  interface Window {
    api: {
      getLanguage: () => Promise<string>
      setLanguage: (lng: string) => Promise<SetLanguageResult>
      onLanguageChanged: (callback: (lng: string) => void) => () => void
      openFileDialog: () => Promise<OpenedFile | null>
      readFile: (filePath: string) => Promise<OpenedFile | null>
      onFileOpened: (callback: (file: OpenedFile) => void) => () => void
      getTheme: () => Promise<GetThemeResult>
      setTheme: (theme: GetThemeResult) => Promise<boolean>
      onThemeChanged: (callback: (theme: GetThemeResult) => void) => () => void
      onTabClose: (callback: () => void) => () => void
    }
  }
}
