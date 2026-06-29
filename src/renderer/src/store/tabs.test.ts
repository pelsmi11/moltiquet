import { describe, it, expect, beforeEach } from 'vitest'
import { useTabsStore } from './tabs'

const fileA = { path: '/a.md', name: 'a.md', content: '# A' }
const fileB = { path: '/b.md', name: 'b.md', content: '# B' }

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeId: null })
})

describe('openFile', () => {
  it('adds a new tab and makes it active', () => {
    useTabsStore.getState().openFile(fileA)
    const { tabs, activeId } = useTabsStore.getState()
    expect(tabs).toHaveLength(1)
    expect(activeId).toBe('/a.md')
  })

  it('focuses existing tab instead of duplicating', () => {
    useTabsStore.getState().openFile(fileA)
    useTabsStore.getState().openFile(fileB)
    useTabsStore.getState().openFile(fileA)
    const { tabs, activeId } = useTabsStore.getState()
    expect(tabs).toHaveLength(2)
    expect(activeId).toBe('/a.md')
  })
})

describe('closeTab', () => {
  it('removes the tab', () => {
    useTabsStore.getState().openFile(fileA)
    useTabsStore.getState().closeTab('/a.md')
    expect(useTabsStore.getState().tabs).toHaveLength(0)
  })

  it('activates the next tab when active tab is closed', () => {
    useTabsStore.getState().openFile(fileA)
    useTabsStore.getState().openFile(fileB)
    useTabsStore.getState().closeTab('/b.md')
    expect(useTabsStore.getState().activeId).toBe('/a.md')
  })

  it('sets activeId to null when last tab is closed', () => {
    useTabsStore.getState().openFile(fileA)
    useTabsStore.getState().closeTab('/a.md')
    expect(useTabsStore.getState().activeId).toBeNull()
  })
})

describe('setActive', () => {
  it('changes the active tab', () => {
    useTabsStore.getState().openFile(fileA)
    useTabsStore.getState().openFile(fileB)
    useTabsStore.getState().setActive('/a.md')
    expect(useTabsStore.getState().activeId).toBe('/a.md')
  })
})
