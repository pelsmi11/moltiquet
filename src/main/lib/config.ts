import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface AppConfig {
  language: string
  theme: 'light' | 'dark'
}

export const DEFAULT_CONFIG: AppConfig = { language: 'en', theme: 'light' }

export function readConfig(filePath: string): AppConfig {
  if (!existsSync(filePath)) return { ...DEFAULT_CONFIG }
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as Partial<AppConfig>
    return { ...DEFAULT_CONFIG, ...raw }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function writeConfig(filePath: string, config: AppConfig): void {
  writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8')
}
