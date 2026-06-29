import { readFileSync } from 'fs'
import { dialog, BrowserWindow } from 'electron'
import type { OpenedFile } from '@shared/ipc'
import { isMarkdownPath, getFileName } from '../lib/file'

export class FileProvider {
  readFile(filePath: string): OpenedFile | null {
    if (!isMarkdownPath(filePath)) return null
    try {
      const content = readFileSync(filePath, 'utf-8')
      return { path: filePath, name: getFileName(filePath), content }
    } catch {
      return null
    }
  }

  async showOpenDialog(win: BrowserWindow): Promise<OpenedFile | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
    })
    if (canceled || filePaths.length === 0) return null
    return this.readFile(filePaths[0])
  }
}
