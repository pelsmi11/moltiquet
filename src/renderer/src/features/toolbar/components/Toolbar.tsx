import { useTranslation } from 'react-i18next'
import { FolderOpen, Moon, SlidersHorizontal, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ToolbarProps {
  isDark: boolean
  onToggleTheme: () => void
  onOpenFile: () => void
}

export function Toolbar({ isDark, onToggleTheme, onOpenFile }: ToolbarProps): React.JSX.Element {
  const { t } = useTranslation(['settings', 'reader'])

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground max-[760px]:hidden">
        <span className="hidden min-[1100px]:inline">{t('reader:search')}</span>
        <span className="rounded border border-current px-1 py-0.5 text-[10px] opacity-75">⌘F</span>
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t('reader:optionsMenu')}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onOpenFile}>
            <FolderOpen className="size-4" />
            {t('reader:openFile')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onToggleTheme}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {t(isDark ? 'theme.switchToLight' : 'theme.switchToDark')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
