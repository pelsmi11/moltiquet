import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { sampleHeadings } from '../../reader/utils/constants/sample-headings'

export function TableOfContents(): React.JSX.Element {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-muted/30">
      <ScrollArea className="h-full">
        <nav className="p-4">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </p>
          <ul className="space-y-1">
            {sampleHeadings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={cn(
                    'block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    h.level === 3 && 'pl-5 text-[13px]'
                  )}
                >
                  {h.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  )
}
