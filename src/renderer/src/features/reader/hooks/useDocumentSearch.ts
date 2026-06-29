import { useState, useRef, useEffect, useLayoutEffect, useCallback, type RefObject } from 'react'
import { findMatches, type Match } from '../lib/search'
import { highlightMatches, clearHighlights, setActiveMatch, scrollToMatch } from '../lib/highlight'

export interface DocumentSearch {
  query: string
  count: number
  activeIndex: number
  isOpen: boolean
  setQuery: (q: string) => void
  next: () => void
  prev: () => void
  close: () => void
  open: () => void
}

export function useDocumentSearch(
  containerRef: RefObject<HTMLElement | null>,
  content: string | null
): DocumentSearch {
  const [query, setQueryState] = useState('')
  const [debounced, setDebounced] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(query), query ? 150 : 0)
    return () => clearTimeout(timer.current)
  }, [query])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    return () => clearHighlights(container)
  }, [containerRef])

  // Re-find and highlight on every debounced query change. We MUST re-find
  // matches after clearHighlights (rather than in a separate useEffect) so
  // text node references are always fresh — otherwise the DOM mutations
  // from clearing invalidate offsets and splitText throws IndexSizeError.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    clearHighlights(container)

    if (!debounced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatches([])
      return
    }

    const fresh = findMatches(container, debounced)
    setMatches(fresh)
    setActiveIndex(0)

    if (fresh.length > 0) {
      highlightMatches(container, fresh)
    }
  }, [debounced, containerRef, content])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || matches.length === 0) return
    setActiveMatch(container, activeIndex)
    scrollToMatch(container, activeIndex)
  }, [activeIndex, matches, containerRef])

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
  }, [])

  const next = useCallback(() => {
    setActiveIndex((prev) => {
      const len = Math.max(matches.length, 1)
      return (((prev + 1) % len) + len) % len
    })
  }, [matches.length])

  const prev = useCallback(() => {
    setActiveIndex((prev) => {
      const len = Math.max(matches.length, 1)
      return (((prev - 1) % len) + len) % len
    })
  }, [matches.length])

  const close = useCallback(() => {
    setIsOpen(false)
    setQueryState('')
    setDebounced('')
    setMatches([])
    setActiveIndex(0)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  return {
    query,
    count: matches.length,
    activeIndex,
    isOpen,
    setQuery,
    next,
    prev,
    close,
    open
  }
}
