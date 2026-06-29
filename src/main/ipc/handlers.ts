import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { ConfigProvider } from '../providers/config-provider'

interface HandlerDeps {
  configProvider: ConfigProvider
}

export function registerIpcHandlers({ configProvider }: HandlerDeps): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_LANGUAGE, (): string => {
    return configProvider.get('language')
  })
}
