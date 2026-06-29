import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS, type SetLanguageResult, type GetThemeResult } from '@shared/ipc'
import type { ConfigProvider } from '../providers/config-provider'
import type { FileProvider } from '../providers/file-provider'

interface HandlerDeps {
  configProvider: ConfigProvider
  fileProvider: FileProvider
}

export function registerIpcHandlers({ configProvider, fileProvider }: HandlerDeps): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_LANGUAGE, (): string => {
    return configProvider.get('language')
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET_LANGUAGE, (_event, lng: string): SetLanguageResult => {
    if (typeof lng !== 'string' || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lng)) {
      return { success: false, error: 'Invalid language' }
    }
    configProvider.set('language', lng)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, async () => {
    const [win] = BrowserWindow.getAllWindows()
    if (!win) return null
    return fileProvider.showOpenDialog(win)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_READ, (_event, filePath: string) => {
    return fileProvider.readFile(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.THEME_GET, (): GetThemeResult => {
    return configProvider.get('theme')
  })

  ipcMain.handle(IPC_CHANNELS.THEME_SET, (_event, theme: string): boolean => {
    if (theme !== 'light' && theme !== 'dark') return false
    configProvider.set('theme', theme as GetThemeResult)
    return true
  })
}
