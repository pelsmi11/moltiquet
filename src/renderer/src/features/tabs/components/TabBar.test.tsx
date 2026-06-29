import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockTabs } from '../utils/constants/mock-tabs'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  it('renders a button for each tab', () => {
    render(<TabBar tabs={mockTabs} activeId={mockTabs[0].id} onSelect={vi.fn()} />)
    for (const tab of mockTabs) {
      expect(screen.getByText(tab.name)).toBeInTheDocument()
    }
  })

  it('calls onSelect with the tab id when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<TabBar tabs={mockTabs} activeId={mockTabs[0].id} onSelect={onSelect} />)

    await user.click(screen.getByText(mockTabs[1].name))

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(mockTabs[1].id)
  })

  it('renders the "Open file" button', () => {
    render(<TabBar tabs={mockTabs} activeId={mockTabs[0].id} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Open file' })).toBeInTheDocument()
  })
})
