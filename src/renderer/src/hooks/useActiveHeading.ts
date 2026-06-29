import { useState, useEffect, type RefObject } from 'react'

export function useActiveHeading(containerRef: RefObject<HTMLElement | null>): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const headings = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const top = visible.reduce((best, e) =>
          e.intersectionRatio > best.intersectionRatio ? e : best
        )
        setActiveId(top.target.id)
      },
      { root: container, rootMargin: '-10% 0px -80% 0px', threshold: 0.1 }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [containerRef])

  return activeId
}
