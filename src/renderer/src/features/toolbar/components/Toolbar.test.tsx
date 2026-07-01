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
      isDark={props?.isDark ?? false}
      onToggleTheme={props?.onToggleTheme ?? vi.fn()}
      onOpenFile={props?.onOpenFile ?? vi.fn()}
    />,
    { wrapper }
  )
}

describe('Toolbar', () => {
  it('shows the search shortcut hint', () => {
    renderToolbar()
    expect(screen.getByText('⌘F')).toBeInTheDocument()
  })

  it('calls onOpenFile when the "Open a Markdown file" option is selected', async () => {
    const user = userEvent.setup()
    const onOpenFile = vi.fn()
    renderToolbar({ onOpenFile })
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.click(await screen.findByText('Open a Markdown file'))
    expect(onOpenFile).toHaveBeenCalledOnce()
  })

  it('calls onToggleTheme when the theme option is selected', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    renderToolbar({ onToggleTheme })
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await user.click(await screen.findByText('Switch to dark theme'))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('shows "Switch to light theme" in the options menu when dark mode is active', async () => {
    const user = userEvent.setup()
    renderToolbar({ isDark: true })
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(await screen.findByText('Switch to light theme')).toBeInTheDocument()
  })
})
