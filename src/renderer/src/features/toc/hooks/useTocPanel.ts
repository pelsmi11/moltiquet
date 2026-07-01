import { useEffect, useState } from 'react'
import { usePanelRef, type OnPanelResize } from 'react-resizable-panels'

interface TocPanel {
  panelRef: ReturnType<typeof usePanelRef>
  collapsed: boolean
  onPanelResize: NonNullable<OnPanelResize>
  collapse: () => void
  expand: () => void
}

/** Manages the resizable TOC sidebar: tracks collapsed state, auto-collapses on
 *  narrow (<760px) windows, and exposes imperative collapse/expand. */
export function useTocPanel(): TocPanel {
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = usePanelRef()

  useEffect(() => {
    const onResize = (): void => {
      if (window.innerWidth < 760 && !collapsed) panelRef.current?.collapse()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [collapsed, panelRef])

  const onPanelResize: NonNullable<OnPanelResize> = (size) => {
    if (size.asPercentage === 0) setCollapsed(true)
    else if (collapsed) setCollapsed(false)
  }

  return {
    panelRef,
    collapsed,
    onPanelResize,
    collapse: () => panelRef.current?.collapse(),
    expand: () => panelRef.current?.expand()
  }
}
