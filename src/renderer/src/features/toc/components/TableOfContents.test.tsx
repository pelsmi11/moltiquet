import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleHeadings } from '../../reader/utils/constants/sample-headings'
import { TableOfContents } from './TableOfContents'

describe('TableOfContents', () => {
  it('renders a link for each heading', () => {
    render(<TableOfContents />)
    for (const h of sampleHeadings) {
      expect(screen.getByRole('link', { name: h.title })).toBeInTheDocument()
    }
  })

  it('each link href matches the heading id', () => {
    render(<TableOfContents />)
    for (const h of sampleHeadings) {
      expect(screen.getByRole('link', { name: h.title })).toHaveAttribute('href', `#${h.id}`)
    }
  })

  it('renders the section label', () => {
    render(<TableOfContents />)
    expect(screen.getByText(/on this page/i)).toBeInTheDocument()
  })
})
