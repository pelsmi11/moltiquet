import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTabsStore } from '@/store/tabs'
import { initRendererI18n } from './lib/i18n'
import App from './App'

beforeAll(() => initRendererI18n('en'))

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeId: null })
  document.documentElement.classList.remove('dark')
})

// jsdom gives every element a zero-size rect, so react-resizable-panels' global
// pointerdown listener false-positives a hit on the resize separator and calls
// preventDefault(), which makes Radix ignore a plain click on the trigger.
// Keyboard activation dispatches a real "click" with no pointerdown, sidestepping it.
async function openOptionsMenu(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  screen.getByRole('button', { name: 'Options' }).focus()
  await user.keyboard('{Enter}')
}

describe('App', () => {
  it('shows empty state when no file is open', async () => {
    render(<App />)
    expect(await screen.findByText('No file open')).toBeInTheDocument()
  })

  it('shows tab name after opening a file via store', async () => {
    useTabsStore.setState({
      tabs: [{ id: '/README.md', name: 'README.md', content: '# Hello' }],
      activeId: '/README.md'
    })
    render(<App />)
    const nameElements = await screen.findAllByText('README.md')
    expect(nameElements.length).toBeGreaterThanOrEqual(1)
  })

  it('loads initial theme from main process on mount', async () => {
    render(<App />)
    await waitFor(() => {
      expect(window.api.getTheme).toHaveBeenCalled()
    })
  })

  it('adds the dark class to documentElement when the theme toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await openOptionsMenu(user)
    await user.click(await screen.findByText('Switch to dark theme'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.api.setTheme).toHaveBeenCalledWith('dark')
  })

  it('removes the dark class when toggled again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openOptionsMenu(user)
    await user.click(await screen.findByText('Switch to dark theme'))
    await openOptionsMenu(user)
    await user.click(await screen.findByText('Switch to light theme'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.api.setTheme).toHaveBeenCalledWith('light')
  })

  it('subscribes to theme:changed push events', async () => {
    render(<App />)
    expect(window.api.onThemeChanged).toHaveBeenCalled()
  })

  it('subscribes to tab:close push events', async () => {
    render(<App />)
    expect(window.api.onTabClose).toHaveBeenCalled()
  })

  it('restores previously open tabs and the active tab from the session on mount', async () => {
    vi.mocked(window.api.getSession).mockResolvedValueOnce({
      openFiles: ['/a.md', '/b.md'],
      activeFile: '/b.md'
    })
    vi.mocked(window.api.readFile)
      .mockResolvedValueOnce({ path: '/a.md', name: 'a.md', content: '# A' })
      .mockResolvedValueOnce({ path: '/b.md', name: 'b.md', content: '# B' })
    render(<App />)
    await waitFor(() => {
      expect(useTabsStore.getState().tabs.map((t) => t.id)).toEqual(['/a.md', '/b.md'])
    })
    expect(useTabsStore.getState().activeId).toBe('/b.md')
  })

  it('silently skips a restored path that no longer reads from disk', async () => {
    vi.mocked(window.api.getSession).mockResolvedValueOnce({
      openFiles: ['/a.md', '/deleted.md'],
      activeFile: '/deleted.md'
    })
    vi.mocked(window.api.readFile)
      .mockResolvedValueOnce({ path: '/a.md', name: 'a.md', content: '# A' })
      .mockResolvedValueOnce(null)
    render(<App />)
    await waitFor(() => {
      expect(useTabsStore.getState().tabs.map((t) => t.id)).toEqual(['/a.md'])
    })
    expect(useTabsStore.getState().activeId).toBe('/a.md')
  })

  it('persists the session after opening a file', async () => {
    const user = userEvent.setup()
    vi.mocked(window.api.openFileDialog).mockResolvedValueOnce({
      path: '/c.md',
      name: 'c.md',
      content: '# C'
    })
    render(<App />)
    await waitFor(() => expect(window.api.getSession).toHaveBeenCalled())
    await user.click(screen.getByRole('button', { name: 'Open a Markdown file' }))
    await waitFor(() => {
      expect(window.api.setSession).toHaveBeenCalledWith({
        openFiles: ['/c.md'],
        activeFile: '/c.md'
      })
    })
  })
})
