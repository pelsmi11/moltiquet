import { ElectronAPI } from '@electron-toolkit/preload'
import type { SetLanguageResult } from '@shared/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getLanguage: () => Promise<string>
      setLanguage: (lng: string) => Promise<SetLanguageResult>
      onLanguageChanged: (callback: (lng: string) => void) => () => void
    }
  }
}
