import { describe, it, expect } from 'vitest'
import { resolveLanguage, createMainI18n, SUPPORTED_LANGUAGES } from './i18n'

describe('resolveLanguage', () => {
  it('maps en-US to en', () => {
    expect(resolveLanguage('en-US')).toBe('en')
  })

  it('maps es-419 to es', () => {
    expect(resolveLanguage('es-419')).toBe('es')
  })

  it('maps unsupported language to en fallback', () => {
    expect(resolveLanguage('fr')).toBe('en')
    expect(resolveLanguage('de-DE')).toBe('en')
    expect(resolveLanguage('zh-CN')).toBe('en')
  })

  it('handles bare supported codes', () => {
    expect(resolveLanguage('en')).toBe('en')
    expect(resolveLanguage('es')).toBe('es')
  })

  it('is case-insensitive', () => {
    expect(resolveLanguage('EN-US')).toBe('en')
    expect(resolveLanguage('ES')).toBe('es')
  })
})

describe('SUPPORTED_LANGUAGES', () => {
  it('contains en and es', () => {
    expect(SUPPORTED_LANGUAGES).toContain('en')
    expect(SUPPORTED_LANGUAGES).toContain('es')
  })
})

describe('createMainI18n', () => {
  it('returns English translations for en', async () => {
    const i18n = await createMainI18n('en')
    expect(i18n.t('file.open')).toBe('Open File…')
    expect(i18n.t('file.quit')).toBe('Quit')
    expect(i18n.t('help.about')).toBe('About Moltiquet')
  })

  it('returns Spanish translations for es', async () => {
    const i18n = await createMainI18n('es')
    expect(i18n.t('file.open')).toBe('Abrir archivo…')
    expect(i18n.t('file.quit')).toBe('Salir')
  })

  it('falls back to en for unsupported language', async () => {
    const i18n = await createMainI18n('fr')
    expect(i18n.t('file.open')).toBe('Open File…')
  })

  it('creates isolated instances (different lng each call)', async () => {
    const en = await createMainI18n('en')
    const es = await createMainI18n('es')
    expect(en.t('file.quit')).toBe('Quit')
    expect(es.t('file.quit')).toBe('Salir')
  })
})
