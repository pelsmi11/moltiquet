export const IPC_CHANNELS = {
  SETTINGS_GET_LANGUAGE: 'settings:get-language',
  SETTINGS_SET_LANGUAGE: 'settings:set-language',
  LANGUAGE_CHANGED: 'language:changed',
  FILE_OPEN_DIALOG: 'file:open-dialog',
  FILE_READ: 'file:read',
  FILE_OPENED: 'file:opened',
  THEME_GET: 'theme:get',
  THEME_SET: 'theme:set',
  THEME_CHANGED: 'theme:changed',
  TAB_CLOSE: 'tab:close'
} as const

export type SetLanguagePayload = string
export type SetLanguageResult = { success: true } | { success: false; error: string }
export type GetLanguageResult = string
export type GetThemeResult = 'light' | 'dark'

export interface OpenedFile {
  path: string
  name: string
  content: string
}
