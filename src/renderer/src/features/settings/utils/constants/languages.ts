export const SUPPORTED_LANGUAGES = ['en', 'es'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
