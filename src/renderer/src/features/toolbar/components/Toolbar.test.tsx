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

describe('Toolbar', () => {
  it('renders the file name', () => {
    render(<Toolbar fileName="ARCHITECTURE.md" isDark={false} onToggleTheme={vi.fn()} />, {
      wrapper
    })
    expect(screen.getByText('ARCHITECTURE.md')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<Toolbar fileName="README.md" isDark={false} onToggleTheme={vi.fn()} />, { wrapper })
    expect(screen.getByPlaceholderText('Find in document…')).toBeInTheDocument() // en translation value
  })

  it('calls onToggleTheme when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    render(<Toolbar fileName="README.md" isDark={false} onToggleTheme={onToggleTheme} />, {
      wrapper
    })
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('shows "Switch to light theme" aria-label when dark mode is active', () => {
    render(<Toolbar fileName="README.md" isDark={true} onToggleTheme={vi.fn()} />, { wrapper })
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
  })
})
