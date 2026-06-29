import type { OpenTab } from '../../interfaces/tab.interface'

// ponytail: hardcoded open files for the mock; real tabs come from a zustand store later.
export const mockTabs: OpenTab[] = [
  { id: 'readme', name: 'README.md' },
  { id: 'architecture', name: 'ARCHITECTURE.md' }
]
