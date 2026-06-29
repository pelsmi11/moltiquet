import { describe, it, expect } from 'vitest'
import { extractHeadings } from './extract-headings'

describe('extractHeadings', () => {
  it('extracts h1–h6 with correct levels', () => {
    const md = '# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six'
    const headings = extractHeadings(md)
    expect(headings.map((h) => h.level)).toEqual([1, 2, 3, 4, 5, 6])
    expect(headings.map((h) => h.title)).toEqual(['One', 'Two', 'Three', 'Four', 'Five', 'Six'])
  })

  it('slugs titles correctly', () => {
    const headings = extractHeadings('## Hello World\n## Hello World')
    expect(headings[0].id).toBe('hello-world')
    expect(headings[1].id).toBe('hello-world-1') // deduped by github-slugger
  })

  it('skips # inside fenced code blocks (backtick)', () => {
    const md = '## Real\n```\n# Not a heading\n```\n## Also Real'
    const headings = extractHeadings(md)
    expect(headings).toHaveLength(2)
    expect(headings.map((h) => h.title)).toEqual(['Real', 'Also Real'])
  })

  it('skips # inside fenced code blocks (tilde)', () => {
    const md = '## Real\n~~~\n# Not a heading\n~~~'
    const headings = extractHeadings(md)
    expect(headings).toHaveLength(1)
  })

  it('returns empty array for content with no headings', () => {
    expect(extractHeadings('Just a paragraph')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(extractHeadings('')).toEqual([])
  })
})
