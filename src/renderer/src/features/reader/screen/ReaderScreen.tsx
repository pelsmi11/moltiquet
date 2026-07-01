import { useMemo, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useTabsStore } from '@/store/tabs'
import { useActiveHeading } from '@/hooks/useActiveHeading'
import { useHighlightTheme } from '@/hooks/useHighlightTheme'
import { useLanguageSync } from '@/hooks/useLanguageSync'
import { useTheme } from '@/hooks/useTheme'
import { extractHeadings } from '@/features/toc/utils/functions/extract-headings'
import { useTocPanel } from '@/features/toc/hooks/useTocPanel'
import { useTabSync } from '@/features/tabs/hooks/useTabSync'
import { useSessionRestore } from '@/features/tabs/hooks/useSessionRestore'
import { useDocumentSearch } from '@/features/reader/hooks/useDocumentSearch'
import { SearchBar } from '@/features/reader/components/SearchBar'
import { TabBar } from '@/features/tabs/components/TabBar'
import { Toolbar } from '@/features/toolbar/components/Toolbar'
import { TableOfContents } from '@/features/toc/components/TableOfContents'
import { ReaderView } from '@/features/reader/components/ReaderView'

/** Top-level composed screen: the tab/toolbar bar, the resizable TOC sidebar,
 *  and the Markdown reader with in-document search. */
export function ReaderScreen(): React.JSX.Element {
  const readerScrollRef = useRef<HTMLDivElement>(null)
  const { tabs, activeId } = useTabsStore()

  const { isDark, toggleTheme } = useTheme()
  const { openFile } = useTabSync()
  const toc = useTocPanel()

  useLanguageSync()
  useSessionRestore()
  useHighlightTheme(isDark)
  const activeHeadingId = useActiveHeading(readerScrollRef)

  const activeTab = tabs.find((t) => t.id === activeId) ?? null
  const search = useDocumentSearch(readerScrollRef, activeTab?.content ?? null)
  const headings = useMemo(() => (activeTab ? extractHeadings(activeTab.content) : []), [activeTab])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="flex h-11 items-center gap-1 border-b border-border bg-background pl-1 pr-2">
        <TabBar onOpenFile={openFile} />
        <Toolbar isDark={isDark} onToggleTheme={toggleTheme} onOpenFile={openFile} />
      </div>
      <div className="relative min-h-0 flex-1">
        {toc.collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-3 z-10 size-6 rounded-l-none border border-l-0 border-border bg-background text-muted-foreground shadow-sm"
            aria-label="Expand sidebar"
            onClick={toc.expand}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        )}
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel
            panelRef={toc.panelRef}
            defaultSize="22"
            minSize="14"
            maxSize="40"
            collapsible
            collapsedSize="0"
            onResize={toc.onPanelResize}
          >
            <TableOfContents
              headings={headings}
              activeId={activeHeadingId}
              onCollapse={toc.collapse}
            />
          </ResizablePanel>
          <ResizableHandle className="w-px bg-border transition-colors hover:bg-primary/40" />
          <ResizablePanel defaultSize="78">
            <div className="relative h-full">
              <SearchBar search={search} />
              <ReaderView
                content={activeTab?.content ?? null}
                onOpenFile={openFile}
                scrollRef={readerScrollRef}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
