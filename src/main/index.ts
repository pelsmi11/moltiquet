import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { IPC_CHANNELS } from '@shared/ipc'
import { createMainI18n } from './lib/i18n'
import { buildAppMenu, notifyRendererLanguageChanged, notifyThemeChanged } from './lib/menu'
import { ConfigProvider } from './providers/config-provider'
import { FileProvider } from './providers/file-provider'
import { FileAssociationProvider } from './providers/file-association-provider'
import { registerIpcHandlers } from './ipc/handlers'

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 520,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('http:') || details.url.startsWith('https:')) {
      shell.openExternal(details.url)
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const [win] = BrowserWindow.getAllWindows()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    const argPath = argv
      .slice(app.isPackaged ? 1 : 2)
      .find((a) => a.endsWith('.md') || a.endsWith('.markdown'))
    if (argPath && mainWindow) {
      const file = new FileProvider().readFile(argPath)
      if (file) mainWindow.webContents.send(IPC_CHANNELS.FILE_OPENED, file)
    }
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.moltiquet.desktop')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    const configProvider = new ConfigProvider()
    const fileProvider = new FileProvider()
    const fileAssociationProvider = new FileAssociationProvider(fileProvider)

    const storedLng = configProvider.get('language') || app.getLocale()
    const mainI18n = await createMainI18n(storedLng)

    const handleOpenFile = async (): Promise<void> => {
      const [win] = BrowserWindow.getAllWindows()
      if (!win) return
      const file = await fileProvider.showOpenDialog(win)
      if (file) win.webContents.send('file:opened', file)
    }

    const handleToggleTheme = (): void => {
      const current = configProvider.get('theme')
      const next = current === 'light' ? 'dark' : 'light'
      configProvider.set('theme', next)
      notifyThemeChanged(next)
    }

    const handleCloseTab = (): void => {
      const [win] = BrowserWindow.getAllWindows()
      if (win) win.webContents.send(IPC_CHANNELS.TAB_CLOSE)
    }

    const handleLanguageChange = async (lng: string): Promise<void> => {
      configProvider.set('language', lng)
      await mainI18n.changeLanguage(lng)
      rebuildMenu()
      notifyRendererLanguageChanged(lng)
    }

    const rebuildMenu = (): void => {
      buildAppMenu(
        mainI18n.t.bind(mainI18n),
        mainI18n.language,
        handleLanguageChange,
        handleOpenFile,
        handleToggleTheme,
        handleCloseTab
      )
    }

    fileAssociationProvider.register()
    rebuildMenu()
    registerIpcHandlers({ configProvider, fileProvider })

    mainWindow = createWindow()
    mainWindow.webContents.once('did-finish-load', () => {
      fileAssociationProvider.flushPending(mainWindow!)
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
