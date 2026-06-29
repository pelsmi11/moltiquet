import type { Heading } from '../../interfaces/heading.interface'

/** Headings the TableOfContents links to — must match the ids rendered in SampleDocument. */
export const sampleHeadings: Heading[] = [
  { id: 'introduction', title: 'Introduction', level: 2 },
  { id: 'installation', title: 'Installation', level: 2 },
  { id: 'features', title: 'Features', level: 2 },
  { id: 'keyboard-shortcuts', title: 'Keyboard shortcuts', level: 3 },
  { id: 'configuration', title: 'Configuration', level: 2 }
]
