import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, FileText, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/store/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TabBarProps {
  onOpenFile: () => void
}

export function TabBar({ onOpenFile }: TabBarProps): React.JSX.Element {
  const { tabs, activeId, setActive, closeTab } = useTabsStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { t } = useTranslation('reader')

  const filtered = tabs.filter((tab) => tab.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'group flex h-8 w-[138px] shrink-0 items-center gap-2 rounded-md px-2.5 text-sm transition-colors',
              tab.id === activeId
                ? 'bg-brand/10 font-medium text-brand dark:bg-brand/15'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">{tab.name}</span>
            <X
              className="size-3.5 shrink-0 rounded opacity-0 hover:bg-accent group-hover:opacity-60"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
            />
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label={t('addFile')}
          onClick={onOpenFile}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {tabs.length > 0 && (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) setQuery('')
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label={t('showAllTabs')}
            >
              <ChevronDown className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-2">
            <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-sm text-muted-foreground">
              <Search className="size-3.5 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchTabs')}
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ScrollArea className="mt-2 max-h-56">
              <div className="flex flex-col gap-0.5 pr-2">
                {filtered.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActive(tab.id)
                      setOpen(false)
                    }}
                    className={cn(
                      'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      tab.id === activeId ? 'text-brand' : 'text-foreground hover:bg-accent'
                    )}
                  >
                    <FileText className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-left">{tab.name}</span>
                    <X
                      className="size-3.5 shrink-0 rounded opacity-60 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id)
                      }}
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
