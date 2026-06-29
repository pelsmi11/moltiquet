import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  highlightMatches,
  clearHighlights,
  setActiveMatch,
  scrollToMatch,
  matchCount
} from './highlight'
import { findMatches } from './search'

function div(html: string): HTMLDivElement {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('highlightMatches', () => {
  it('wraps matches in mark elements', () => {
    const root = div('<p>hello world</p>')
    const matches = findMatches(root, 'world')
    highlightMatches(root, matches)
    expect(root.querySelector('mark.search-match')).toBeTruthy()
    expect(root.querySelector('mark.search-match')?.textContent).toBe('world')
  })

  it('applies data-search-i attributes', () => {
    const root = div('<p>foo bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    const marks = root.querySelectorAll('mark.search-match')
    expect(marks).toHaveLength(2)
    expect(marks[0].getAttribute('data-search-i')).toBe('0')
    expect(marks[1].getAttribute('data-search-i')).toBe('1')
  })

  it('clears previous highlights before applying new ones', () => {
    const root = div('<p>foo bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(2)

    clearHighlights(root)
    const singleMatch = findMatches(root, 'bar')
    highlightMatches(root, singleMatch)
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(1)
    expect(root.querySelector('mark.search-match')?.textContent).toBe('bar')
  })

  it('preserves surrounding text', () => {
    const root = div('<p>before match after</p>')
    const matches = findMatches(root, 'match')
    highlightMatches(root, matches)
    expect(root.textContent).toBe('before match after')
  })

  it('handles multiple matches in the same text node', () => {
    const root = div('<p>foo bar foo baz foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    const marks = root.querySelectorAll('mark.search-match')
    expect(marks).toHaveLength(3)
    expect(marks[0].textContent).toBe('foo')
    expect(marks[1].textContent).toBe('foo')
    expect(marks[2].textContent).toBe('foo')
  })

  it('handles a match at the start of the text node', () => {
    const root = div('<p>foo bar</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    const mark = root.querySelector('mark.search-match')
    expect(mark?.textContent).toBe('foo')
    expect(mark?.nextSibling?.textContent).toBe(' bar')
  })

  it('handles a match at the end of the text node', () => {
    const root = div('<p>bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    const mark = root.querySelector('mark.search-match')
    expect(mark?.textContent).toBe('foo')
    expect(mark?.previousSibling?.textContent).toBe('bar ')
  })

  it('is a no-op when matches array is empty', () => {
    const root = div('<p>hello world</p>')
    expect(() => highlightMatches(root, [])).not.toThrow()
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(0)
    expect(root.textContent).toBe('hello world')
  })

  it('preserves nested HTML structure around matches', () => {
    const root = div('<p>before <em>italic</em> after</p>')
    const matches = findMatches(root, 'italic')
    highlightMatches(root, matches)
    const em = root.querySelector('em')
    expect(em).toBeTruthy()
    expect(em?.querySelector('mark.search-match')).toBeTruthy()
    expect(em?.querySelector('mark.search-match')?.textContent).toBe('italic')
  })
})

describe('clearHighlights', () => {
  it('removes all mark elements and restores text', () => {
    const root = div('<p>hello world</p>')
    const matches = findMatches(root, 'world')
    highlightMatches(root, matches)
    clearHighlights(root)
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(0)
    expect(root.textContent).toBe('hello world')
  })

  it('is idempotent', () => {
    const root = div('<p>hello</p>')
    clearHighlights(root)
    expect(root.textContent).toBe('hello')
    clearHighlights(root)
    expect(root.textContent).toBe('hello')
  })

  it('is safe to call on a container with deeply nested marks', () => {
    const root = div('<div><div><p>foo <em><strong>foo</strong></em> foo</p></div></div>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    expect(root.querySelectorAll('mark.search-match').length).toBe(3)
    clearHighlights(root)
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(0)
    expect(root.textContent).toBe('foo foo foo')
  })
})

describe('setActiveMatch', () => {
  it('toggles search-match-active class on the active match', () => {
    const root = div('<p>foo bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)

    setActiveMatch(root, 0)
    const marks = root.querySelectorAll('mark.search-match')
    expect(marks[0].classList.contains('search-match-active')).toBe(true)
    expect(marks[1].classList.contains('search-match-active')).toBe(false)

    setActiveMatch(root, 1)
    expect(marks[0].classList.contains('search-match-active')).toBe(false)
    expect(marks[1].classList.contains('search-match-active')).toBe(true)
  })

  it('is a no-op when no marks exist', () => {
    const root = div('<p>hello</p>')
    expect(() => setActiveMatch(root, 0)).not.toThrow()
    expect(root.querySelectorAll('mark.search-match')).toHaveLength(0)
  })

  it('clears active class from all when index does not match any mark', () => {
    const root = div('<p>foo bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    setActiveMatch(root, 0)
    expect(
      root
        .querySelector('mark.search-match[data-search-i="0"]')
        ?.classList.contains('search-match-active')
    ).toBe(true)

    setActiveMatch(root, 99)
    expect(root.querySelectorAll('mark.search-match.search-match-active')).toHaveLength(0)
  })
})

describe('scrollToMatch', () => {
  it('calls scrollIntoView on the target mark', () => {
    const root = div('<p>foo bar foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    scrollToMatch(root, 0)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('does nothing when no mark exists for the index', () => {
    const root = div('<p>foo</p>')
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    vi.mocked(Element.prototype.scrollIntoView).mockClear()
    scrollToMatch(root, 99)
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('does nothing on an empty container', () => {
    const root = div('<p>hello</p>')
    expect(() => scrollToMatch(root, 0)).not.toThrow()
  })
})

describe('matchCount', () => {
  it('returns 0 when no marks exist', () => {
    const root = div('<p>hello</p>')
    expect(matchCount(root)).toBe(0)
  })

  it('returns the number of highlighted matches', () => {
    const root = div('<p>foo bar foo</p>')
    expect(matchCount(root)).toBe(0)
    const matches = findMatches(root, 'foo')
    highlightMatches(root, matches)
    expect(matchCount(root)).toBe(2)
  })

  it('decreases after clearHighlights', () => {
    const root = div('<p>foo bar foo baz foo</p>')
    highlightMatches(root, findMatches(root, 'foo'))
    expect(matchCount(root)).toBe(3)
    clearHighlights(root)
    expect(matchCount(root)).toBe(0)
  })
})
