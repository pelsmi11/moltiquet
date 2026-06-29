// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { readConfig, writeConfig, DEFAULT_CONFIG } from './config'

const testDir = join(tmpdir(), 'moltiquet-config-test-' + process.pid)
mkdirSync(testDir, { recursive: true })
afterAll(() => rmSync(testDir, { recursive: true, force: true }))

const freshPath = (): string => join(testDir, `config-${Date.now()}-${Math.random()}.json`)

describe('readConfig', () => {
  it('returns DEFAULT_CONFIG when file does not exist', () => {
    expect(readConfig(join(testDir, 'nonexistent.json'))).toEqual(DEFAULT_CONFIG)
  })

  it('merges stored values with defaults', () => {
    const p = freshPath()
    writeFileSync(p, JSON.stringify({ language: 'es', theme: 'light' }), 'utf-8')
    const result = readConfig(p)
    expect(result.language).toBe('es')
    expect(result.theme).toBe('light')
  })

  it('returns DEFAULT_CONFIG for a corrupt file', () => {
    const p = freshPath()
    writeFileSync(p, 'not json', 'utf-8')
    expect(readConfig(p)).toEqual(DEFAULT_CONFIG)
  })

  it('uses DEFAULT_CONFIG theme when key is absent in stored file', () => {
    const p = freshPath()
    writeFileSync(p, JSON.stringify({ language: 'es' }), 'utf-8')
    expect(readConfig(p).theme).toBe(DEFAULT_CONFIG.theme)
  })
})

describe('writeConfig', () => {
  it('persists config that can be read back correctly', () => {
    const p = freshPath()
    const config = { language: 'es', theme: 'dark' as const }
    writeConfig(p, config)
    expect(readConfig(p)).toEqual(config)
  })

  it('writes valid pretty-printed JSON', () => {
    const p = freshPath()
    writeConfig(p, DEFAULT_CONFIG)
    const raw = JSON.parse(readFileSync(p, 'utf-8'))
    expect(raw).toEqual(DEFAULT_CONFIG)
  })
})
