import { describe, expect, it } from 'vitest'
import { findMatches } from './search'

function div(html: string): HTMLDivElement {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

describe('findMatches', () => {
  it('returns empty for empty query', () => {
    expect(findMatches(div('hello'), '')).toEqual([])
  })

  it('finds a single match', () => {
    const root = div('<p>hello world</p>')
    expect(findMatches(root, 'world')).toHaveLength(1)
  })

  it('finds multiple matches', () => {
    const root = div('<p>foo bar foo</p>')
    expect(findMatches(root, 'foo')).toHaveLength(2)
  })

  it('returns correct offsets', () => {
    const root = div('<p>abc</p>')
    const [match] = findMatches(root, 'bc')
    expect(match.startOffset).toBe(1)
    expect(match.endOffset).toBe(3)
    expect(match.text).toBe('bc')
  })

  it('is case-insensitive by default', () => {
    const root = div('<p>Hello World</p>')
    expect(findMatches(root, 'world')).toHaveLength(1)
    expect(findMatches(root, 'hello')).toHaveLength(1)
  })

  it('respects matchCase option', () => {
    const root = div('<p>Hello World</p>')
    expect(findMatches(root, 'hello', { matchCase: true })).toHaveLength(0)
    expect(findMatches(root, 'Hello', { matchCase: true })).toHaveLength(1)
  })

  it('ignores text inside script tags', () => {
    const root = div('<p>visible</p><script>invisible</script>')
    expect(findMatches(root, 'invisible')).toHaveLength(0)
  })

  it('ignores text inside style tags', () => {
    const root = div('<style>.hidden { color: red }</style><p>visible</p>')
    expect(findMatches(root, 'hidden')).toHaveLength(0)
  })

  it('ignores text inside existing mark tags', () => {
    const root = div('<p>hello <mark class="search-match">world</mark></p>')
    expect(findMatches(root, 'world')).toHaveLength(0)
  })

  it('ignores text inside aria-hidden elements', () => {
    const root = div('<p>visible</p><span aria-hidden="true">hidden</span>')
    expect(findMatches(root, 'hidden')).toHaveLength(0)
    expect(findMatches(root, 'visible')).toHaveLength(1)
  })

  it('ignores text inside contenteditable elements', () => {
    const root = div('<p>visible</p><div contenteditable="true">editable</div>')
    expect(findMatches(root, 'editable')).toHaveLength(0)
    expect(findMatches(root, 'visible')).toHaveLength(1)
  })

  it('ignores text inside nested aria-hidden', () => {
    const root = div('<p>before</p><div aria-hidden="true"><p>inside</p></div><p>after</p>')
    expect(findMatches(root, 'inside')).toHaveLength(0)
    expect(findMatches(root, 'before')).toHaveLength(1)
    expect(findMatches(root, 'after')).toHaveLength(1)
  })

  it('escapes regex special characters in query', () => {
    const root = div('<p>a.b is a pattern</p>')
    // Literal "." should not match every char
    expect(findMatches(root, 'a.b')).toHaveLength(1)
    expect(findMatches(root, 'a*b')).toHaveLength(0)
  })

  it('handles queries with parentheses and brackets', () => {
    const root = div('<p>(foo) [bar] {baz}</p>')
    expect(findMatches(root, '(foo)')).toHaveLength(1)
    expect(findMatches(root, '[bar]')).toHaveLength(1)
    expect(findMatches(root, '{baz}')).toHaveLength(1)
  })

  it('handles queries with backslashes', () => {
    const root = div('<p>path\\to\\file</p>')
    expect(findMatches(root, 'path\\to\\file')).toHaveLength(1)
  })

  it('returns empty for no matches', () => {
    const root = div('<p>foo bar</p>')
    expect(findMatches(root, 'baz')).toHaveLength(0)
  })

  it('matches across multiple elements', () => {
    const root = div('<p>abc</p><p>def</p><p>abc</p>')
    expect(findMatches(root, 'abc')).toHaveLength(2)
  })

  it('matches in deeply nested elements', () => {
    const root = div('<div><section><article><p>find me</p></article></section></div>')
    expect(findMatches(root, 'find')).toHaveLength(1)
    expect(findMatches(root, 'me')).toHaveLength(1)
  })

  it('preserves text node reference', () => {
    const root = div('<p>hello world</p>')
    const [match] = findMatches(root, 'world')
    expect(match.node.nodeType).toBe(Node.TEXT_NODE)
    expect(match.node.textContent).toBe('hello world')
  })

  it('handles Unicode characters', () => {
    const root = div('<p>café résumé naïve</p>')
    expect(findMatches(root, 'café')).toHaveLength(1)
    expect(findMatches(root, 'résumé')).toHaveLength(1)
  })
})
