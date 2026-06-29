import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleHeadings } from '../utils/constants/sample-headings'
import { SampleDocument } from './SampleDocument'

describe('SampleDocument', () => {
  it('renders the document title', () => {
    render(<SampleDocument />)
    expect(screen.getByRole('heading', { level: 1, name: 'Moltiquet' })).toBeInTheDocument()
  })

  it('renders a heading element for every entry in sampleHeadings', () => {
    render(<SampleDocument />)
    for (const h of sampleHeadings) {
      expect(screen.getByRole('heading', { name: h.title })).toBeInTheDocument()
    }
  })

  // TOC contract: every id listed in sampleHeadings must exist in the DOM.
  // A mismatch here means the TOC would link to a missing anchor.
  it('every sampleHeadings id has a matching element id in the document', () => {
    const { container } = render(<SampleDocument />)
    for (const h of sampleHeadings) {
      expect(container.querySelector(`#${h.id}`)).not.toBeNull()
    }
  })
})
