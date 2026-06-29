export interface Match {
  node: Text
  startOffset: number
  endOffset: number
  text: string
}

export function findMatches(
  root: HTMLElement,
  query: string,
  opts?: { matchCase?: boolean }
): Match[] {
  if (!query) return []

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const flags = opts?.matchCase ? 'g' : 'gi'
  const regex = new RegExp(escaped, flags)
  const results: Match[] = []

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement
      if (!el) return NodeFilter.FILTER_REJECT
      const tag = el.tagName
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') return NodeFilter.FILTER_REJECT
      if (el.closest('[contenteditable], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })

  let textNode: Text | null
  while ((textNode = walker.nextNode() as Text | null)) {
    const text = textNode.textContent ?? ''
    for (const match of text.matchAll(regex)) {
      results.push({
        node: textNode,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        text: match[0]
      })
    }
  }

  return results
}
