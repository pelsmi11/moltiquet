import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initRendererI18n } from '@/lib/i18n'
import { useTabsStore } from '@/store/tabs'
import { TabBar } from './TabBar'

beforeAll(() => initRendererI18n('en'))

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <TooltipProvider>{children}</TooltipProvider>
)

const renderTabBar = (onOpenFile = vi.fn()): ReturnType<typeof render> =>
  render(<TabBar onOpenFile={onOpenFile} />, { wrapper })

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
    renderTabBar()
    expect(screen.getByText('a.md')).toBeInTheDocument()
    expect(screen.getByText('b.md')).toBeInTheDocument()
  })

  it('switches the active tab when a tab is clicked', async () => {
    const user = userEvent.setup()
    useTabsStore.setState({
      tabs: [
        { id: '/a.md', name: 'a.md', content: '' },
        { id: '/b.md', name: 'b.md', content: '' }
      ],
      activeId: '/a.md'
    })
    renderTabBar()
    await user.click(screen.getByText('b.md'))
    expect(useTabsStore.getState().activeId).toBe('/b.md')
  })

  it('hides the "show all tabs" button when there are no tabs', () => {
    renderTabBar()
    expect(screen.queryByRole('button', { name: 'Show all open tabs' })).not.toBeInTheDocument()
  })

  it('calls onOpenFile when the "add file" button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenFile = vi.fn()
    renderTabBar(onOpenFile)
    await user.click(screen.getByRole('button', { name: 'Add file' }))
    expect(onOpenFile).toHaveBeenCalledOnce()
  })

  it('filters and jumps to a tab from the "show all tabs" popover', async () => {
    const user = userEvent.setup()
    useTabsStore.setState({
      tabs: [
        { id: '/a.md', name: 'a.md', content: '' },
        { id: '/b.md', name: 'b.md', content: '' }
      ],
      activeId: '/a.md'
    })
    renderTabBar()
    await user.click(screen.getByRole('button', { name: 'Show all open tabs' }))
    await user.type(await screen.findByPlaceholderText('Search open tabs'), 'b.md')
    await user.click(screen.getAllByText('b.md')[1])
    expect(useTabsStore.getState().activeId).toBe('/b.md')
  })

  it('closes a tab from the "show all tabs" popover without switching to it', async () => {
    const user = userEvent.setup()
    useTabsStore.setState({
      tabs: [
        { id: '/a.md', name: 'a.md', content: '' },
        { id: '/b.md', name: 'b.md', content: '' }
      ],
      activeId: '/a.md'
    })
    renderTabBar()
    await user.click(screen.getByRole('button', { name: 'Show all open tabs' }))
    await screen.findByPlaceholderText('Search open tabs')
    const rows = screen.getAllByText('b.md')
    const closeIcon = rows[1].closest('button')!.querySelector('svg:last-child')!
    await user.click(closeIcon)
    expect(useTabsStore.getState().tabs.map((t) => t.id)).toEqual(['/a.md'])
    expect(useTabsStore.getState().activeId).toBe('/a.md')
  })
})
