import type { Match } from './search'

export function highlightMatches(_container: HTMLElement, matches: Match[]): void {
  for (let i = matches.length - 1; i >= 0; i--) {
    const { node, startOffset, endOffset } = matches[i]
    splitAndWrap(node, startOffset, endOffset, i)
  }
}

export function clearHighlights(container: HTMLElement): void {
  const marks = container.querySelectorAll('mark.search-match')
  marks.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
    parent.normalize()
  })
}

export function setActiveMatch(container: HTMLElement, index: number): void {
  container.querySelectorAll('mark.search-match').forEach((m) => {
    m.classList.toggle('search-match-active', m.getAttribute('data-search-i') === String(index))
  })
}

export function scrollToMatch(container: HTMLElement, index: number): void {
  const mark = container.querySelector(`mark.search-match[data-search-i="${index}"]`)
  if (mark) {
    mark.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

export function matchCount(container: HTMLElement): number {
  return container.querySelectorAll('mark.search-match').length
}

function splitAndWrap(node: Text, startOffset: number, endOffset: number, index: number): void {
  node.splitText(endOffset)
  const mid = node.splitText(startOffset)
  const mark = document.createElement('mark')
  mark.className = 'search-match'
  mark.dataset.searchI = String(index)
  mid.parentNode!.replaceChild(mark, mid)
  mark.appendChild(mid)
}
