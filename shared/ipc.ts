export const IPC_CHANNELS = {
  SETTINGS_GET_LANGUAGE: 'settings:get-language',
  SETTINGS_SET_LANGUAGE: 'settings:set-language',
  LANGUAGE_CHANGED: 'language:changed'
} as const

export type SetLanguagePayload = string
export type SetLanguageResult = { success: true } | { success: false; error: string }
export type GetLanguageResult = string
