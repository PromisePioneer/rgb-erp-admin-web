/**
 * Translation Store
 * Manages app translations fetched from Laravel backend
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

interface TranslationState {
  locale: 'en' | 'id'
  translations: Record<string, unknown>
  isLoading: boolean
  isLoaded: boolean

  // Actions
  setLocale: (locale: 'en' | 'id') => void
  fetchTranslations: () => Promise<void>
  t: (key: string, params?: Record<string, string | number>) => string
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      locale: 'id',
      translations: {},
      isLoading: false,
      isLoaded: false,

      setLocale: (locale) => {
        set({ locale })
        // Fetch new translations when locale changes
        get().fetchTranslations()
      },

      fetchTranslations: async () => {
        const { locale } = get()
        set({ isLoading: true })

        try {
          const response = await apiClient.get(`/translations/${locale}`)
          set({
            translations: response.data.data.translations || {},
            isLoading: false,
            isLoaded: true,
          })
        } catch (error) {
          console.error('Failed to fetch translations:', error)
          set({ isLoading: false })
        }
      },

      // Translation function with parameter support
      t: (key, params) => {
        const { translations } = get()
        let value = key.split('.').reduce((obj: unknown, k) => {
          if (obj && typeof obj === 'object' && k in obj) {
            return (obj as Record<string, unknown>)[k]
          }
          return undefined
        }, translations as unknown) as string | undefined

        // Fallback to key if not found
        if (!value) {
          value = key
        }

        // Replace parameters
        if (params) {
          Object.entries(params).forEach(([param, val]) => {
            value = value?.replace(new RegExp(`:${param}`, 'g'), String(val))
          })
        }

        return value
      },
    }),
    {
      name: 'translation-storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
)
