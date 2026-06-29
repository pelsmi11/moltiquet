import GithubSlugger from 'github-slugger'
import type { Heading } from '../../../reader/interfaces/heading.interface'

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const m = line.match(/^(#{1,6})\s+(.+)/)
    if (!m) continue
    const level = m[1].length as Heading['level']
    const title = m[2].trim()
    headings.push({ id: slugger.slug(title), title, level })
  }

  return headings
}
