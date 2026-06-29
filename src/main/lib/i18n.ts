import i18next, { type i18n } from 'i18next'
import enMenu from '../../../locales/en/menu.json'
import esMenu from '../../../locales/es/menu.json'

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** Maps BCP-47 codes like 'en-US' or 'es-419' to our supported base code; falls back to 'en'. */
export function resolveLanguage(bcp47: string): SupportedLanguage {
  const base = bcp47.split('-')[0].toLowerCase()
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base)
    ? (base as SupportedLanguage)
    : 'en'
}

/** Creates an isolated i18next instance for the main process. Safe to call in tests. */
export async function createMainI18n(lng: string): Promise<i18n> {
  const instance = i18next.createInstance()
  await instance.init({
    lng: resolveLanguage(lng),
    fallbackLng: 'en',
    load: 'languageOnly',
    defaultNS: 'menu',
    resources: {
      en: { menu: enMenu },
      es: { menu: esMenu }
    },
    interpolation: { escapeValue: false }
  })
  return instance
}
