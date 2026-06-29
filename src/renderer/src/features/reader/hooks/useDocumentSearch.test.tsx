import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentSearch } from './useDocumentSearch'

vi.mock('../lib/highlight', () => ({
  clearHighlights: vi.fn(),
  highlightMatches: vi.fn(),
  setActiveMatch: vi.fn(),
  scrollToMatch: vi.fn(),
  matchCount: vi.fn(() => 0)
}))

function createContainer(html: string): HTMLDivElement {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

describe('useDocumentSearch', () => {
  it('starts closed with empty state', () => {
    const ref = { current: createContainer('<p>hello</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))
    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
    expect(result.current.count).toBe(0)
    expect(result.current.activeIndex).toBe(0)
  })

  it('sets query and finds matches after debounce', () => {
    const ref = { current: createContainer('<p>foo bar foo</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))

    act(() => result.current.setQuery('foo'))
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(result.current.query).toBe('foo')
    expect(result.current.count).toBe(2)
  })

  it('debounces rapid query changes', () => {
    const ref = { current: createContainer('<p>foo bar foo</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))

    act(() => result.current.setQuery('f'))
    act(() => result.current.setQuery('fo'))
    act(() => result.current.setQuery('foo'))
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(result.current.count).toBe(2)
  })

  it('navigates through matches with next/prev', () => {
    const ref = { current: createContainer('<p>foo bar foo</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))

    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))

    expect(result.current.activeIndex).toBe(0)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(1)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(1)
  })

  it('open and close toggle visibility', () => {
    const ref = { current: createContainer('<p>hello</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))

    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
    expect(result.current.count).toBe(0)
  })

  it('reports count 0 when query has no matches', () => {
    const ref = { current: createContainer('<p>foo bar</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar'))
    act(() => result.current.setQuery('xyz'))
    act(() => vi.advanceTimersByTime(150))
    expect(result.current.count).toBe(0)
  })

  it('does not call highlightMatches when count is 0', async () => {
    const highlight = await import('../lib/highlight')
    const ref = { current: createContainer('<p>foo bar</p>') }
    renderHook(() => useDocumentSearch(ref, 'foo bar'))
    act(() => vi.advanceTimersByTime(0))
    expect(highlight.highlightMatches).not.toHaveBeenCalled()
  })

  it('next/prev stay at 0 when there are no matches', () => {
    const ref = { current: createContainer('<p>hello</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'hello'))
    act(() => result.current.setQuery('xyz'))
    act(() => vi.advanceTimersByTime(150))
    expect(result.current.count).toBe(0)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(0)
  })

  it('resets activeIndex to 0 on new search', () => {
    const ref = { current: createContainer('<p>foo bar foo baz foo</p>') }
    const { result } = renderHook(() => useDocumentSearch(ref, 'foo bar foo baz foo'))
    act(() => result.current.setQuery('foo'))
    act(() => vi.advanceTimersByTime(150))
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(2)

    act(() => result.current.setQuery('baz'))
    act(() => vi.advanceTimersByTime(150))
    expect(result.current.activeIndex).toBe(0)
  })

  it('clears highlights on unmount', async () => {
    const highlight = await import('../lib/highlight')
    const ref = { current: createContainer('<p>foo</p>') }
    const { unmount } = renderHook(() => useDocumentSearch(ref, 'foo'))
    unmount()
    expect(highlight.clearHighlights).toHaveBeenCalledWith(ref.current)
  })

  it('clears the debounce timer on unmount', () => {
    const ref = { current: createContainer('<p>foo</p>') }
    const { result, unmount } = renderHook(() => useDocumentSearch(ref, 'foo'))
    act(() => result.current.setQuery('fo'))
    unmount()
    act(() => vi.advanceTimersByTime(200))
    // After unmount, the count should remain 0 (the debounced setDebounced was cancelled)
    // We can only assert no throw — the hook is unmounted
  })
})
