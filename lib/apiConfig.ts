import { atom } from 'jotai'

export type ApiStatus = 'unconfigured' | 'working' | 'error'

export const apiStatusAtom = atom<ApiStatus>('unconfigured')
export const apiErrorAtom = atom<string | null>(null)

export function getApiKeyFromEnv(): string | null {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null
}

export function validateApiKeyFormat(key: string): boolean {
  return /^[A-Za-z0-9_-]{20,}$/.test(key)
}
