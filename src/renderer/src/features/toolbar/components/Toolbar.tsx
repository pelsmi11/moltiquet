import { useTranslation } from 'react-i18next'
import { FolderOpen, Moon, Search, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ToolbarProps {
  fileName: string | null
  isDark: boolean
  onToggleTheme: () => void
  onOpenFile: () => void
  onOpenSearch: () => void
}

export function Toolbar({
  fileName,
  isDark,
  onToggleTheme,
  onOpenFile,
  onOpenSearch
}: ToolbarProps): React.JSX.Element {
  const { t } = useTranslation(['settings', 'reader'])

  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-background px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={t('reader:openFile')}
            onClick={onOpenFile}
          >
            <FolderOpen className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('reader:openFile')}</TooltipContent>
      </Tooltip>

      <span className="truncate text-sm font-medium text-foreground">{fileName ?? ''}</span>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <div className="ml-auto" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={t('reader:search')}
            onClick={onOpenSearch}
          >
            <Search className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('reader:search')}</TooltipContent>
      </Tooltip>

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
