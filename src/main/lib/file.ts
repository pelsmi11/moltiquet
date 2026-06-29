import { extname, basename } from 'path'

export const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown'])

export function isMarkdownPath(filePath: string): boolean {
  return MARKDOWN_EXTENSIONS.has(extname(filePath).toLowerCase())
}

export function getFileName(filePath: string): string {
  return basename(filePath)
}
