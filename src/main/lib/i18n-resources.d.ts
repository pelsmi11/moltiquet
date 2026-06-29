import type enMenu from '../../../locales/en/menu.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'menu'
    resources: {
      menu: typeof enMenu
    }
  }
}
