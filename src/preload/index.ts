import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, type SetLanguageResult } from '@shared/ipc'

const api = {
  getLanguage: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_LANGUAGE),
  setLanguage: (lng: string): Promise<SetLanguageResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_LANGUAGE, lng),
  onLanguageChanged: (callback: (lng: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, lng: string): void => callback(lng)
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LANGUAGE_CHANGED, handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
