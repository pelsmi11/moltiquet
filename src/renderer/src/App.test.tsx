import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { useTabsStore } from '@/store/tabs'
import { initRendererI18n } from './lib/i18n'
import App from './App'

beforeAll(() => initRendererI18n('en'))

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeId: null })
  document.documentElement.classList.remove('dark')
})

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
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.api.setTheme).toHaveBeenCalledWith('dark')
  })

  it('removes the dark class when toggled again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
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
})
