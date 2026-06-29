import { app } from 'electron'
import { join } from 'path'
import { readConfig, writeConfig, type AppConfig } from '../lib/config'

export class ConfigProvider {
  private readonly filePath = join(app.getPath('userData'), 'config.json')

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return readConfig(this.filePath)[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    writeConfig(this.filePath, { ...readConfig(this.filePath), [key]: value })
  }
}
