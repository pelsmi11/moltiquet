import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentSearch } from './useDocumentSearch'
import * as highlightModule from '../lib/highlight'

function createContainer(html: string): HTMLDivElement {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

beforeEach(() => {
  vi.spyOn(highlightModule, 'clearHighlights').mockImplementation((container) => {
    const marks = container.querySelectorAll('mark.search-match')
    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark)
      }
      parent.removeChild(mark)
      parent.normalize()
    })
  })
  vi.useFakeTimers()
  Element.prototype.scrollIntoView = vi.fn()
})

describe('useDocumentSearch integration', () => {
  it('does not throw IndexSizeError when re-highlighting across content changes', () => {
    const container = createContainer('<p>foo bar foo baz foo</p>')
    const ref = { current: container }
    const { result, rerender } = renderHook(({ content }) => useDocumentSearch(ref, content), {
      initialProps: { content: 'foo bar foo baz foo' }
    })

    expect(() => {
      act(() => result.current.setQuery('foo'))
      act(() => vi.advanceTimersByTime(150))
    }).not.toThrow()
    expect(result.current.count).toBe(3)

    expect(() => {
      rerender({ content: 'different content here' })
      act(() => vi.advanceTimersByTime(150))
    }).not.toThrow()

    expect(() => {
      rerender({ content: 'foo bar foo baz foo' })
      act(() => vi.advanceTimersByTime(150))
    }).not.toThrow()

    expect(result.current.count).toBe(3)
  })

  it('produces marks in the DOM after a search', () => {
    const container = createContainer('<p>foo bar foo</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar foo'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    const marks = container.querySelectorAll('mark.search-match')
    expect(marks.length).toBe(2)
  })

  it('clears marks from previous search before applying new ones', () => {
    const container = createContainer('<p>foo bar baz</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar baz'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelectorAll('mark.search-match').length).toBe(1)

    act(() => result.current.setQuery('bar'))
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelectorAll('mark.search-match').length).toBe(1)
    expect(container.querySelector('mark.search-match')?.textContent).toBe('bar')
  })

  it('highlights matches across markdown-style inline elements (em, code, a)', () => {
    const container = createContainer(
      '<p>foo <em>foo</em> <code>foo</code> <a href="#">foo</a></p>'
    )
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo foo foo foo'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    expect(result.current.count).toBe(4)
    expect(container.querySelectorAll('mark.search-match').length).toBe(4)
  })

  it('handles the active match CSS class being applied', () => {
    const container = createContainer('<p>foo bar foo</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar foo'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    // Default activeIndex is 0
    let active = container.querySelector('mark.search-match.search-match-active')
    expect(active).toBeTruthy()
    expect(active?.getAttribute('data-search-i')).toBe('0')

    act(() => result.current.next())
    active = container.querySelector('mark.search-match.search-match-active')
    expect(active?.getAttribute('data-search-i')).toBe('1')
  })

  it('scrolls the active match into view', () => {
    const container = createContainer('<p>foo bar foo</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar foo'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('clears DOM highlights when query is cleared', () => {
    const container = createContainer('<p>foo bar foo</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar foo'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelectorAll('mark.search-match').length).toBe(2)

    act(() => result.current.setQuery(''))
    act(() => vi.advanceTimersByTime(0))
    expect(container.querySelectorAll('mark.search-match').length).toBe(0)
  })

  it('does not throw on a content with no matches', () => {
    const container = createContainer('<p>hello world</p>')
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello world'))

    expect(() => {
      act(() => result.current.setQuery('xyz'))
      act(() => vi.advanceTimersByTime(150))
    }).not.toThrow()
    expect(result.current.count).toBe(0)
  })

  it('handles very long documents with many matches', () => {
    const longText = 'foo '.repeat(100).trim()
    const container = createContainer(`<p>${longText}</p>`)
    const ref = { current: container }
    const { result } = renderHook(() => useDocumentSearch(ref, longText))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    expect(result.current.count).toBe(100)
    expect(container.querySelectorAll('mark.search-match').length).toBe(100)
  })
})
