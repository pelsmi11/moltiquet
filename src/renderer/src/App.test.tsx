import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { initRendererI18n } from './lib/i18n'
import App from './App'

beforeAll(() => initRendererI18n('en'))

describe('App', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('shows the first tab filename in the toolbar by default', () => {
    render(<App />)
    // README.md appears both in the tab and in the toolbar filename
    expect(screen.getAllByText('README.md').length).toBeGreaterThanOrEqual(2)
  })

  it('updates the toolbar filename when switching tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('ARCHITECTURE.md'))

    // After switching, ARCHITECTURE.md now shows in both the active tab and the toolbar
    expect(screen.getAllByText('ARCHITECTURE.md').length).toBeGreaterThanOrEqual(2)
  })

  it('adds the dark class to documentElement when the theme toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class when toggled again', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
