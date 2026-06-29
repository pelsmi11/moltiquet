import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import i18next from 'i18next'
import { initRendererI18n } from './i18n'

// Initialize once; the guard in initRendererI18n makes it idempotent
beforeAll(() => {
  initRendererI18n('en')
})

// Reset language to English before each test so language-switch tests don't bleed
afterEach(async () => {
  await i18next.changeLanguage('en')
})

describe('initRendererI18n', () => {
  it('resolves reader.toc in English', () => {
    expect(i18next.t('reader:toc')).toBe('Table of Contents')
  })

  it('resolves common.appName in English', () => {
    expect(i18next.t('common:appName')).toBe('Moltiquet')
  })

  it('resolves settings.language.label in English', () => {
    expect(i18next.t('settings:language.label')).toBe('Language')
  })

  it('is idempotent — second call with different lng does not reinitialise', () => {
    initRendererI18n('es')
    // Language is still 'en' because the second call was a no-op
    expect(i18next.language).toBe('en')
    expect(i18next.t('reader:toc')).toBe('Table of Contents')
  })

  it('resolves Spanish strings after changeLanguage', async () => {
    await i18next.changeLanguage('es')
    expect(i18next.t('reader:toc')).toBe('Tabla de contenidos')
  })

  it('falls back to English for keys missing in Spanish', async () => {
    await i18next.changeLanguage('es')
    // common.openFile exists in en but not es — falls back gracefully
    expect(i18next.t('common:openFile')).toBe('Open file')
  })
})
