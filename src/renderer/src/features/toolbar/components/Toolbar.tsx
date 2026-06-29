import { Moon, Search, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ToolbarProps {
  fileName: string
  isDark: boolean
  onToggleTheme: () => void
}

export function Toolbar({ fileName, isDark, onToggleTheme }: ToolbarProps): React.JSX.Element {
  const { t } = useTranslation(['settings', 'reader'])

  return (
    <div className="flex h-12 items-center gap-3 border-b border-border bg-background px-4">
      <span className="truncate text-sm font-medium text-muted-foreground">{fileName}</span>
      <div className="relative ml-auto w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {/* ponytail: visual only — no search wiring in the mock */}
        <Input placeholder={t('reader:searchPlaceholder')} className="h-8 pl-8" />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            onClick={onToggleTheme}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('theme.toggle')}</TooltipContent>
      </Tooltip>
    </div>
  )
}
