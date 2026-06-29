import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useTabsStore } from '@/store/tabs'
import { TabBar } from './TabBar'

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <TooltipProvider>{children}</TooltipProvider>
)

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeId: null })
})

describe('TabBar', () => {
  it('renders a button for each open tab', () => {
    useTabsStore.setState({
      tabs: [
        { id: '/a.md', name: 'a.md', content: '' },
        { id: '/b.md', name: 'b.md', content: '' }
      ],
      activeId: '/a.md'
    })
    render(<TabBar onOpenFile={vi.fn()} />, { wrapper })
    expect(screen.getByText('a.md')).toBeInTheDocument()
    expect(screen.getByText('b.md')).toBeInTheDocument()
  })

  it('calls onOpenFile when the + button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenFile = vi.fn()
    render(<TabBar onOpenFile={onOpenFile} />, { wrapper })
    await user.click(screen.getByRole('button', { name: 'Open file' }))
    expect(onOpenFile).toHaveBeenCalledOnce()
  })
})
