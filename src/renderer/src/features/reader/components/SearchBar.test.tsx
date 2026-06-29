import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initRendererI18n } from '@/lib/i18n'
import { SearchBar } from './SearchBar'
import type { DocumentSearch } from '../hooks/useDocumentSearch'

beforeAll(() => initRendererI18n('en'))

function createSearch(overrides?: Partial<DocumentSearch>): DocumentSearch {
  return {
    query: '',
    count: 0,
    activeIndex: 0,
    isOpen: true,
    setQuery: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    close: vi.fn(),
    open: vi.fn(),
    ...overrides
  }
}

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <TooltipProvider>{children}</TooltipProvider>
)

beforeEach(() => {
  vi.useRealTimers()
})

describe('SearchBar', () => {
  it('renders nothing when closed', () => {
    const search = createSearch({ isOpen: false })
    const { container } = render(<SearchBar search={search} />, { wrapper })
    expect(container.innerHTML).toBe('')
  })

  it('renders the search input when open', () => {
    render(<SearchBar search={createSearch()} />, { wrapper })
    expect(screen.getByPlaceholderText('Find in document…')).toBeInTheDocument()
  })

  it('calls setQuery on input change', async () => {
    const user = userEvent.setup()
    const search = createSearch()
    render(<SearchBar search={search} />, { wrapper })
    await user.type(screen.getByPlaceholderText('Find in document…'), 'x')
    expect(search.setQuery).toHaveBeenCalled()
  })

  it('calls next on Enter', async () => {
    const user = userEvent.setup()
    const search = createSearch()
    render(<SearchBar search={search} />, { wrapper })
    const input = screen.getByPlaceholderText('Find in document…')
    await user.type(input, 'x{Enter}')
    expect(search.next).toHaveBeenCalled()
  })

  it('calls prev on Shift+Enter', async () => {
    const user = userEvent.setup()
    const search = createSearch()
    render(<SearchBar search={search} />, { wrapper })
    await user.type(screen.getByPlaceholderText('Find in document…'), 'x{Shift>}{Enter}{/Shift}')
    expect(search.prev).toHaveBeenCalled()
  })

  it('calls close on Escape (inside the input)', async () => {
    const user = userEvent.setup()
    const search = createSearch()
    render(<SearchBar search={search} />, { wrapper })
    await user.type(screen.getByPlaceholderText('Find in document…'), '{Escape}')
    expect(search.close).toHaveBeenCalled()
  })

  it('displays match count when count > 0', () => {
    const search = createSearch({ query: 'foo', count: 3, activeIndex: 1 })
    render(<SearchBar search={search} />, { wrapper })
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('does not display count when count is 0', () => {
    render(<SearchBar search={createSearch({ query: 'x' })} />, { wrapper })
    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })

  it('calls prev when up button is clicked', async () => {
    const user = userEvent.setup()
    const search = createSearch({ query: 'foo', count: 2 })
    render(<SearchBar search={search} />, { wrapper })
    await user.click(screen.getByRole('button', { name: 'Previous match' }))
    expect(search.prev).toHaveBeenCalled()
  })

  it('calls next when down button is clicked', async () => {
    const user = userEvent.setup()
    const search = createSearch({ query: 'foo', count: 2 })
    render(<SearchBar search={search} />, { wrapper })
    await user.click(screen.getByRole('button', { name: 'Next match' }))
    expect(search.next).toHaveBeenCalled()
  })

  it('calls close when X button is clicked', async () => {
    const user = userEvent.setup()
    const search = createSearch({ query: 'foo' })
    render(<SearchBar search={search} />, { wrapper })
    await user.click(screen.getByRole('button', { name: 'Close search' }))
    expect(search.close).toHaveBeenCalled()
  })

  it('disables prev/next buttons when count is 0', () => {
    render(<SearchBar search={createSearch({ query: 'x', count: 0 })} />, { wrapper })
    expect(screen.getByRole('button', { name: 'Previous match' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next match' })).toBeDisabled()
  })

  it('prev/next buttons are enabled when count > 0', () => {
    render(<SearchBar search={createSearch({ query: 'x', count: 2 })} />, { wrapper })
    expect(screen.getByRole('button', { name: 'Previous match' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next match' })).not.toBeDisabled()
  })

  describe('global keyboard shortcuts', () => {
    it('opens on Ctrl+F and calls preventDefault', () => {
      const search = createSearch({ isOpen: false })
      render(<SearchBar search={search} />, { wrapper })
      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true })
      const preventSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)
      expect(preventSpy).toHaveBeenCalled()
      expect(search.open).toHaveBeenCalled()
    })

    it('opens on Cmd+F (meta key)', () => {
      const search = createSearch({ isOpen: false })
      render(<SearchBar search={search} />, { wrapper })
      const event = new KeyboardEvent('keydown', { key: 'f', metaKey: true, bubbles: true })
      const preventSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)
      expect(preventSpy).toHaveBeenCalled()
      expect(search.open).toHaveBeenCalled()
    })

    it('does nothing on plain F (no modifier)', () => {
      const search = createSearch({ isOpen: false })
      render(<SearchBar search={search} />, { wrapper })
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }))
      expect(search.open).not.toHaveBeenCalled()
    })

    it('does nothing on Ctrl+Shift+F (different shortcut)', () => {
      const search = createSearch({ isOpen: false })
      render(<SearchBar search={search} />, { wrapper })
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, shiftKey: true, bubbles: true })
      )
      expect(search.open).not.toHaveBeenCalled()
    })

    it('closes on Escape when open', () => {
      const search = createSearch({ isOpen: true })
      render(<SearchBar search={search} />, { wrapper })
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(search.close).toHaveBeenCalled()
    })

    it('does not close on Escape when already closed', () => {
      const search = createSearch({ isOpen: false })
      render(<SearchBar search={search} />, { wrapper })
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(search.close).not.toHaveBeenCalled()
    })

    it('removes the global keydown listener on unmount', () => {
      const search = createSearch({ isOpen: false })
      const { unmount } = render(<SearchBar search={search} />, { wrapper })
      unmount()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }))
      expect(search.open).not.toHaveBeenCalled()
    })
  })

  describe('focus management', () => {
    it('focuses the input when isOpen becomes true', async () => {
      vi.useFakeTimers()
      render(<SearchBar search={createSearch({ isOpen: true })} />, { wrapper })
      await vi.runAllTimersAsync()
      const input = screen.getByPlaceholderText('Find in document…') as HTMLInputElement
      expect(document.activeElement).toBe(input)
      vi.useRealTimers()
    })

    it('focuses the input when query changes from empty to non-empty', async () => {
      vi.useFakeTimers()
      const { rerender } = render(<SearchBar search={createSearch({ query: '' })} />, { wrapper })
      rerender(<SearchBar search={createSearch({ query: 'foo' })} />)
      await vi.runAllTimersAsync()
      const input = screen.getByPlaceholderText('Find in document…') as HTMLInputElement
      expect(document.activeElement).toBe(input)
      vi.useRealTimers()
    })
  })
})
