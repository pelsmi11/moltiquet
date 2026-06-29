import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createMainI18n } from './lib/i18n'
import { buildAppMenu, notifyRendererLanguageChanged } from './lib/menu'
import { ConfigProvider } from './providers/config-provider'
import { registerIpcHandlers } from './ipc/handlers'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const configProvider = new ConfigProvider()
  const storedLng = configProvider.get('language') || app.getLocale()
  const mainI18n = await createMainI18n(storedLng)

  const rebuildMenu = (): void => {
    buildAppMenu(mainI18n.t.bind(mainI18n), mainI18n.language, handleLanguageChange)
  }

  const handleLanguageChange = async (lng: string): Promise<void> => {
    configProvider.set('language', lng)
    await mainI18n.changeLanguage(lng)
    rebuildMenu()
    notifyRendererLanguageChanged(lng)
  }

  rebuildMenu()
  registerIpcHandlers({ configProvider })
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
