import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DocumentSearch } from '../hooks/useDocumentSearch'

interface SearchBarProps {
  search: DocumentSearch
}

export function SearchBar({ search }: SearchBarProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('reader')

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key === 'f') {
        e.preventDefault()
        search.open()
      }
      if (e.key === 'Escape' && search.isOpen) {
        search.close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [search])

  useEffect(() => {
    if (search.isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [search.isOpen])

  useEffect(() => {
    if (search.query) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [search.query])

  if (!search.isOpen) return null

  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg">
      <Search className="size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.shiftKey ? search.prev() : search.next()
          } else if (e.key === 'Escape') {
            search.close()
          }
        }}
        placeholder={t('searchPlaceholder')}
        className="h-8 w-48"
      />
      {search.count > 0 && (
        <span className="min-w-[3ch] text-right text-xs tabular-nums text-muted-foreground">
          {search.activeIndex + 1}/{search.count}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={search.prev}
        disabled={search.count === 0}
        aria-label="Previous match"
      >
        <ChevronUp className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={search.next}
        disabled={search.count === 0}
        aria-label="Next match"
      >
        <ChevronDown className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={search.close}
        aria-label="Close search"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
