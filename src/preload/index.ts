import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC_CHANNELS,
  type SetLanguageResult,
  type OpenedFile,
  type GetThemeResult
} from '@shared/ipc'

const api = {
  getLanguage: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_LANGUAGE),
  setLanguage: (lng: string): Promise<SetLanguageResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_LANGUAGE, lng),
  onLanguageChanged: (callback: (lng: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, lng: string): void => callback(lng)
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, handler)
  },
  openFileDialog: (): Promise<OpenedFile | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_DIALOG),
  readFile: (filePath: string): Promise<OpenedFile | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath),
  onFileOpened: (callback: (file: OpenedFile) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, file: OpenedFile): void => callback(file)
    ipcRenderer.on(IPC_CHANNELS.FILE_OPENED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.FILE_OPENED, handler)
  },
  getTheme: (): Promise<GetThemeResult> => ipcRenderer.invoke(IPC_CHANNELS.THEME_GET),
  setTheme: (theme: GetThemeResult): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.THEME_SET, theme),
  onThemeChanged: (callback: (theme: GetThemeResult) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, theme: GetThemeResult): void => callback(theme)
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, handler)
  },
  onTabClose: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on(IPC_CHANNELS.TAB_CLOSE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TAB_CLOSE, handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
