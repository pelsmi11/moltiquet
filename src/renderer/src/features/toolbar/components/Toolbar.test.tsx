import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeAll } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initRendererI18n } from '@/lib/i18n'
import { Toolbar } from './Toolbar'

beforeAll(() => initRendererI18n('en'))

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <TooltipProvider>{children}</TooltipProvider>
)

function renderToolbar(
  props?: Partial<React.ComponentProps<typeof Toolbar>>
): ReturnType<typeof render> {
  return render(
    <Toolbar
      fileName={props?.fileName ?? null}
      isDark={props?.isDark ?? false}
      onToggleTheme={props?.onToggleTheme ?? vi.fn()}
      onOpenFile={props?.onOpenFile ?? vi.fn()}
      onOpenSearch={props?.onOpenSearch ?? vi.fn()}
    />,
    { wrapper }
  )
}

describe('Toolbar', () => {
  it('renders the file name', () => {
    renderToolbar({ fileName: 'ARCHITECTURE.md' })
    expect(screen.getByText('ARCHITECTURE.md')).toBeInTheDocument()
  })

  it('calls onToggleTheme when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    renderToolbar({ onToggleTheme })
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('shows "Switch to light theme" aria-label when dark mode is active', () => {
    renderToolbar({ isDark: true })
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
  })

  it('calls onOpenFile when open button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenFile = vi.fn()
    renderToolbar({ onOpenFile })
    await user.click(screen.getByRole('button', { name: 'Open a Markdown file' }))
    expect(onOpenFile).toHaveBeenCalledOnce()
  })

  it('calls onOpenSearch when search button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenSearch = vi.fn()
    renderToolbar({ onOpenSearch })
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onOpenSearch).toHaveBeenCalledOnce()
  })
})
