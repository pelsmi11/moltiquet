import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Heading } from '../../reader/interfaces/heading.interface'

interface TableOfContentsProps {
  headings: Heading[]
  activeId: string | null
  onCollapse: () => void
}

export function TableOfContents({
  headings,
  activeId,
  onCollapse
}: TableOfContentsProps): React.JSX.Element {
  const { t } = useTranslation('reader')

  return (
    <aside className="relative flex h-full min-w-0 flex-col overflow-hidden border-r border-border bg-muted/30">
      <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('toc')}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
          aria-label="Collapse sidebar"
          onClick={onCollapse}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {headings.length > 0 && (
          <ul className="space-y-0.5">
            {headings.map((h) => {
              const indent = `${(h.level - 1) * 0.75 + 0.5}rem`
              const isActive = h.id === activeId
              return (
                <li key={`${h.id}-${h.level}`}>
                  <a
                    href={`#${h.id}`}
                    style={
                      isActive ? { paddingLeft: `calc(${indent} - 2px)` } : { paddingLeft: indent }
                    }
                    className={cn(
                      'block truncate rounded-md py-1 pr-2 text-sm transition-colors duration-150',
                      isActive
                        ? 'border-l-2 border-primary bg-accent/40 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      h.level >= 3 && 'text-[13px]'
                    )}
                  >
                    {h.title}
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
