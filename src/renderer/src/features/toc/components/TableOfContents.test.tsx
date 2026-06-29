import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { initRendererI18n } from '@/lib/i18n'
import { TableOfContents } from './TableOfContents'
import type { Heading } from '../../reader/interfaces/heading.interface'

beforeAll(() => initRendererI18n('en'))

const headings: Heading[] = [
  { id: 'intro', title: 'Introduction', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api', title: 'API', level: 3 }
]

describe('TableOfContents', () => {
  it('renders a link for each heading', () => {
    render(<TableOfContents headings={headings} activeId={null} onCollapse={vi.fn()} />)
    for (const h of headings) {
      expect(screen.getByRole('link', { name: h.title })).toBeInTheDocument()
    }
  })

  it('each link href matches the heading id', () => {
    render(<TableOfContents headings={headings} activeId={null} onCollapse={vi.fn()} />)
    for (const h of headings) {
      expect(screen.getByRole('link', { name: h.title })).toHaveAttribute('href', `#${h.id}`)
    }
  })

  it('renders the "Table of Contents" label', () => {
    render(<TableOfContents headings={headings} activeId={null} onCollapse={vi.fn()} />)
    expect(screen.getByText('Table of Contents')).toBeInTheDocument()
  })

  it('renders nothing in the list when headings is empty', () => {
    render(<TableOfContents headings={[]} activeId={null} onCollapse={vi.fn()} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('applies active styling to the matching heading', () => {
    render(<TableOfContents headings={headings} activeId="usage" onCollapse={vi.fn()} />)
    const activeLink = screen.getByRole('link', { name: 'Usage' })
    expect(activeLink.className).toContain('border-primary')
  })

  it('calls onCollapse when collapse button is clicked', async () => {
    const { getByRole } = render(
      <TableOfContents headings={headings} activeId={null} onCollapse={vi.fn()} />
    )
    expect(getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
  })
})
