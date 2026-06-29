import { type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownView } from './MarkdownView'

interface ReaderViewProps {
  content: string | null
  onOpenFile: () => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export function ReaderView({ content, onOpenFile, scrollRef }: ReaderViewProps): React.JSX.Element {
  const { t } = useTranslation('reader')

  if (!content) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <FolderOpen className="size-12 opacity-40" />
        <p className="text-sm">{t('noFile')}</p>
        <Button variant="outline" size="sm" onClick={onOpenFile}>
          {t('openFile')}
        </Button>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full flex-1 overflow-y-auto bg-background">
      <MarkdownView content={content} />
    </div>
  )
}
