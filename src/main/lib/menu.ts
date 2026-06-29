import { BrowserWindow, Menu } from 'electron'
import type { TFunction } from 'i18next'
import { IPC_CHANNELS } from '@shared/ipc'
import { SUPPORTED_LANGUAGES } from './i18n'

export function buildAppMenu(
  t: TFunction<'menu'>,
  currentLng: string,
  onLanguageChange: (lng: string) => Promise<void>,
  onOpenFile: () => Promise<void>,
  onToggleTheme: () => void,
  onCloseTab: () => void
): void {
  const menu = Menu.buildFromTemplate([
    {
      label: t('file.menu'),
      submenu: [
        {
          label: t('file.open'),
          accelerator: 'CmdOrCtrl+O',
          click: (): void => {
            onOpenFile().catch(console.error)
          }
        },
        {
          label: t('file.closeTab'),
          accelerator: 'CmdOrCtrl+W',
          click: (): void => {
            onCloseTab()
          }
        },
        { type: 'separator' },
        { label: t('file.quit'), role: 'quit' }
      ]
    },
    {
      label: t('view.menu'),
      submenu: [
        {
          label: t('view.toggleTheme'),
          click: (): void => {
            onToggleTheme()
          }
        },
        { type: 'separator' },
        {
          label: t('view.toggleDevTools'),
          accelerator: 'CmdOrCtrl+Alt+I',
          role: 'toggleDevTools'
        },
        { type: 'separator' },
        {
          label: t('view.language'),
          submenu: SUPPORTED_LANGUAGES.map((lng) => ({
            label: t(`languages.${lng}`),
            type: 'radio' as const,
            checked: currentLng === lng,
            click: (): void => {
              onLanguageChange(lng).catch(console.error)
            }
          }))
        }
      ]
    },
    {
      label: t('help.menu'),
      submenu: [{ label: t('help.about'), role: 'about' }]
    }
  ])
  Menu.setApplicationMenu(menu)
}

/** Pushes language:changed to all open renderer windows. */
export function notifyRendererLanguageChanged(lng: string): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IPC_CHANNELS.LANGUAGE_CHANGED, lng)
  })
}

/** Pushes theme:changed to all open renderer windows. */
export function notifyThemeChanged(theme: 'light' | 'dark'): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IPC_CHANNELS.THEME_CHANGED, theme)
  })
}
