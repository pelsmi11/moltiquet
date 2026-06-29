import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

if (typeof window !== 'undefined') {
  // Radix primitives (ScrollArea, etc.) need ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  // jsdom does not implement IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  }

  // jsdom doesn't implement scrollIntoView
  Element.prototype.scrollIntoView = vi.fn()

  // Radix pointer capture (used by SliderPrimitive and others)
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()

  // Radix uses matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  // Stub the Electron preload bridge so renderer components load without Electron
  Object.assign(window, {
    api: {
      getLanguage: vi.fn(() => Promise.resolve('en')),
      setLanguage: vi.fn(() => Promise.resolve({ success: true })),
      onLanguageChanged: vi.fn(() => vi.fn()),
      openFileDialog: vi.fn(() => Promise.resolve(null)),
      readFile: vi.fn(() => Promise.resolve(null)),
      onFileOpened: vi.fn(() => vi.fn()),
      getTheme: vi.fn(() => Promise.resolve('light')),
      setTheme: vi.fn(() => Promise.resolve(true)),
      onThemeChanged: vi.fn(() => vi.fn()),
      onTabClose: vi.fn(() => vi.fn())
    }
  })
}
