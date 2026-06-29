// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isMarkdownPath, getFileName } from './file'

describe('isMarkdownPath', () => {
  it('accepts .md', () => expect(isMarkdownPath('/docs/README.md')).toBe(true))
  it('accepts .markdown', () => expect(isMarkdownPath('/docs/guide.markdown')).toBe(true))
  it('accepts uppercase .MD', () => expect(isMarkdownPath('/docs/README.MD')).toBe(true))
  it('rejects .txt', () => expect(isMarkdownPath('/docs/notes.txt')).toBe(false))
  it('rejects .pdf', () => expect(isMarkdownPath('/docs/report.pdf')).toBe(false))
  it('rejects no extension', () => expect(isMarkdownPath('/docs/README')).toBe(false))
})

describe('getFileName', () => {
  it('returns the basename', () => expect(getFileName('/some/path/README.md')).toBe('README.md'))
  it('works for windows-style paths', () =>
    expect(getFileName('C:/Users/foo/doc.md')).toBe('doc.md'))
})
