import { useEffect, useState } from 'react'
import i18next from 'i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TabBar } from './features/tabs/components/TabBar'
import { mockTabs } from './features/tabs/utils/constants/mock-tabs'
import { Toolbar } from './features/toolbar/components/Toolbar'
import { TableOfContents } from './features/toc/components/TableOfContents'
import { ReaderView } from './features/reader/components/ReaderView'

function App(): React.JSX.Element {
  const [activeId, setActiveId] = useState(mockTabs[0].id)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = (): void => {
    setIsDark((prev) => {
      document.documentElement.classList.toggle('dark', !prev)
      return !prev
    })
  }

  useEffect(() => {
    return window.api.onLanguageChanged((lng) => {
      i18next.changeLanguage(lng)
    })
  }, [])

  const activeTab = mockTabs.find((t) => t.id === activeId) ?? mockTabs[0]

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TabBar tabs={mockTabs} activeId={activeId} onSelect={setActiveId} />
        <Toolbar fileName={activeTab.name} isDark={isDark} onToggleTheme={toggleTheme} />
        <div className="flex min-h-0 flex-1">
          <TableOfContents />
          <ReaderView />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
