import { FileText, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OpenTab } from '../interfaces/tab.interface'

interface TabBarProps {
  tabs: OpenTab[]
  activeId: string
  onSelect: (id: string) => void
}

export function TabBar({ tabs, activeId, onSelect }: TabBarProps): React.JSX.Element {
  return (
    <div className="flex h-10 items-stretch border-b border-border bg-muted/40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={cn(
            'group flex items-center gap-2 border-r border-border px-4 text-sm transition-colors',
            tab.id === activeId
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:bg-background/50'
          )}
        >
          <FileText className="size-3.5 shrink-0" />
          <span className="max-w-40 truncate">{tab.name}</span>
          <X className="size-3.5 shrink-0 rounded opacity-0 hover:bg-accent group-hover:opacity-60" />
        </button>
      ))}
      <button
        className="flex items-center px-3 text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
        aria-label="Open file"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
