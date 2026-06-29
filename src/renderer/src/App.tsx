import { useEffect, useMemo, useRef, useState } from 'react'
import i18next from 'i18next'
import { ChevronRight } from 'lucide-react'
import { usePanelRef } from 'react-resizable-panels'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useTabsStore } from '@/store/tabs'
import { useActiveHeading } from './hooks/useActiveHeading'
import { useHighlightTheme } from './hooks/useHighlightTheme'
import { extractHeadings } from './features/toc/utils/functions/extract-headings'
import { useDocumentSearch } from './features/reader/hooks/useDocumentSearch'
import { SearchBar } from './features/reader/components/SearchBar'
import { TabBar } from './features/tabs/components/TabBar'
import { Toolbar } from './features/toolbar/components/Toolbar'
import { TableOfContents } from './features/toc/components/TableOfContents'
import { ReaderView } from './features/reader/components/ReaderView'

function App(): React.JSX.Element {
  const [isDark, setIsDark] = useState(false)
  const [tocCollapsed, setTocCollapsed] = useState(false)
  const tocPanelRef = usePanelRef()
  const readerScrollRef = useRef<HTMLDivElement>(null)
  const { tabs, activeId, openFile, closeTab } = useTabsStore()

  useHighlightTheme(isDark)
  const activeHeadingId = useActiveHeading(readerScrollRef)

  const activeTab = tabs.find((t) => t.id === activeId) ?? null
  const search = useDocumentSearch(readerScrollRef, activeTab?.content ?? null)

  useEffect(() => {
    window.api.getTheme().then((theme) => {
      const dark = theme === 'dark'
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    })
  }, [])

  useEffect(() => {
    return window.api.onThemeChanged((theme) => {
      const dark = theme === 'dark'
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    })
  }, [])

  useEffect(() => {
    return window.api.onTabClose(() => {
      if (activeId) closeTab(activeId)
    })
  }, [activeId, closeTab])

  const toggleTheme = (): void => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      window.api.setTheme(next ? 'dark' : 'light')
      return next
    })
  }

  const handleOpenFile = async (): Promise<void> => {
    const file = await window.api.openFileDialog()
    if (file) openFile(file)
  }

  useEffect(() => {
    return window.api.onLanguageChanged((lng) => {
      i18next.changeLanguage(lng)
    })
  }, [])

  useEffect(() => {
    return window.api.onFileOpened((file) => {
      openFile(file)
    })
  }, [openFile])

  const headings = useMemo(() => (activeTab ? extractHeadings(activeTab.content) : []), [activeTab])

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TabBar onOpenFile={handleOpenFile} />
        <Toolbar
          fileName={activeTab?.name ?? null}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenFile={handleOpenFile}
          onOpenSearch={search.open}
        />
        <div className="relative min-h-0 flex-1">
          {tocCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-3 z-10 size-6 rounded-l-none border border-l-0 border-border bg-background text-muted-foreground shadow-sm"
              aria-label="Expand sidebar"
              onClick={() => tocPanelRef.current?.expand()}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          )}
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel
              panelRef={tocPanelRef}
              defaultSize="22"
              minSize="14"
              maxSize="40"
              collapsible
              collapsedSize="0"
              onResize={(size) => {
                if (size.asPercentage === 0) setTocCollapsed(true)
                else if (tocCollapsed) setTocCollapsed(false)
              }}
            >
              <TableOfContents
                headings={headings}
                activeId={activeHeadingId}
                onCollapse={() => tocPanelRef.current?.collapse()}
              />
            </ResizablePanel>
            <ResizableHandle className="w-px bg-border transition-colors hover:bg-primary/40" />
            <ResizablePanel defaultSize="78">
              <div className="relative h-full">
                <SearchBar search={search} />
                <ReaderView
                  content={activeTab?.content ?? null}
                  onOpenFile={handleOpenFile}
                  scrollRef={readerScrollRef}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
