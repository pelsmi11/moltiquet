import { app, BrowserWindow } from 'electron'
import type { OpenedFile } from '@shared/ipc'
import { IPC_CHANNELS } from '@shared/ipc'
import type { FileProvider } from './file-provider'

export class FileAssociationProvider {
  private pendingFile: OpenedFile | null = null

  constructor(private readonly fileProvider: FileProvider) {}

  /** Call once the main window is ready to receive IPC pushes. */
  flushPending(win: BrowserWindow): void {
    if (this.pendingFile) {
      win.webContents.send(IPC_CHANNELS.FILE_OPENED, this.pendingFile)
      this.pendingFile = null
    }
  }

  register(): void {
    // macOS: file opened via Finder / double-click
    app.on('open-file', (event, filePath) => {
      event.preventDefault()
      const file = this.fileProvider.readFile(filePath)
      if (!file) return
      const [win] = BrowserWindow.getAllWindows()
      if (win) {
        win.webContents.send(IPC_CHANNELS.FILE_OPENED, file)
      } else {
        // cold start — app launched by opening a file; renderer not ready yet
        this.pendingFile = file
      }
    })

    // Windows / Linux: path passed in argv
    const argPath = process.argv
      .slice(app.isPackaged ? 1 : 2)
      .find((a) => a.endsWith('.md') || a.endsWith('.markdown'))
    if (argPath) {
      const file = this.fileProvider.readFile(argPath)
      if (file) this.pendingFile = file
    }
  }
}
