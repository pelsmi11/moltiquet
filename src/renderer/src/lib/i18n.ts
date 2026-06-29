import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '../../../../locales/en/common.json'
import enReader from '../../../../locales/en/reader.json'
import enSettings from '../../../../locales/en/settings.json'
import esCommon from '../../../../locales/es/common.json'
import esReader from '../../../../locales/es/reader.json'
import esSettings from '../../../../locales/es/settings.json'

export function initRendererI18n(lng: string): void {
  if (i18next.isInitialized) return
  i18next.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    load: 'languageOnly',
    defaultNS: 'common',
    resources: {
      en: { common: enCommon, reader: enReader, settings: enSettings },
      es: { common: esCommon, reader: esReader, settings: esSettings }
    },
    interpolation: { escapeValue: false }
  })
}
