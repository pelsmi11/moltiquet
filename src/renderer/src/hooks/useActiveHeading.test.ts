import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useActiveHeading } from './useActiveHeading'

let capturedCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null

const mockObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}

function mockEntry(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0
  } as unknown as IntersectionObserverEntry
}

beforeEach(() => {
  capturedCallback = null
  mockObserver.observe.mockClear()
  mockObserver.disconnect.mockClear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        capturedCallback = cb
      }
      observe = mockObserver.observe
      unobserve = mockObserver.unobserve
      disconnect = mockObserver.disconnect
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useActiveHeading', () => {
  it('returns null when containerRef is empty', () => {
    const ref = { current: null }
    const { result } = renderHook(() => useActiveHeading(ref))
    expect(result.current).toBeNull()
  })

  it('returns the id of an intersecting heading', () => {
    const container = document.createElement('div')
    const h2 = document.createElement('h2')
    h2.id = 'intro'
    container.appendChild(h2)
    document.body.appendChild(container)

    const ref = { current: container }
    const { result } = renderHook(() => useActiveHeading(ref))

    act(() => {
      capturedCallback?.([mockEntry(h2, true)])
    })

    expect(result.current).toBe('intro')
    document.body.removeChild(container)
  })

  it('ignores non-intersecting entries and stays null', () => {
    const container = document.createElement('div')
    const h2 = document.createElement('h2')
    h2.id = 'section'
    container.appendChild(h2)
    document.body.appendChild(container)

    const ref = { current: container }
    const { result } = renderHook(() => useActiveHeading(ref))

    act(() => {
      capturedCallback?.([mockEntry(h2, false)])
    })

    expect(result.current).toBeNull()
    document.body.removeChild(container)
  })

  it('picks the heading with highest intersectionRatio when multiple are visible', () => {
    const container = document.createElement('div')
    const h1 = document.createElement('h2')
    h1.id = 'first'
    const h2 = document.createElement('h2')
    h2.id = 'second'
    container.appendChild(h1)
    container.appendChild(h2)
    document.body.appendChild(container)

    const ref = { current: container }
    const { result } = renderHook(() => useActiveHeading(ref))

    act(() => {
      capturedCallback?.([
        {
          target: h1,
          isIntersecting: true,
          intersectionRatio: 0.3
        } as unknown as IntersectionObserverEntry,
        {
          target: h2,
          isIntersecting: true,
          intersectionRatio: 0.8
        } as unknown as IntersectionObserverEntry
      ])
    })

    expect(result.current).toBe('second')
    document.body.removeChild(container)
  })
})
