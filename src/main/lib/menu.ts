import { BrowserWindow, Menu } from 'electron'
import type { TFunction } from 'i18next'
import { IPC_CHANNELS } from '@shared/ipc'
import { SUPPORTED_LANGUAGES } from './i18n'

export function buildAppMenu(
  t: TFunction<'menu'>,
  currentLng: string,
  onLanguageChange: (lng: string) => Promise<void>
): void {
  const menu = Menu.buildFromTemplate([
    {
      label: t('file.menu'),
      submenu: [
        { label: t('file.open') },
        { label: t('file.closeTab') },
        { type: 'separator' },
        { label: t('file.quit'), role: 'quit' }
      ]
    },
    {
      label: t('view.menu'),
      submenu: [
        { label: t('view.toggleTheme') },
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
