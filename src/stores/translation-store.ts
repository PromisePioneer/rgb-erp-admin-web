/**
 * Translation Store
 * Manages app translations fetched from Laravel backend
 * Preloads and caches translations for instant switching
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

interface TranslationState {
  locale: 'en' | 'id'
  translations: Record<string, unknown>
  cachedTranslations: Record<'en' | 'id', Record<string, unknown>>
  isLoading: boolean
  isLoaded: boolean

  // Actions
  setLocale: (locale: 'en' | 'id') => void
  fetchTranslations: (locale?: 'en' | 'id') => Promise<void>
  preloadTranslations: () => Promise<void>
  t: (key: string, params?: Record<string, string | number>) => string
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      locale: 'id',
      translations: {},
      cachedTranslations: { en: {}, id: {} },
      isLoading: false,
      isLoaded: false,

      setLocale: (locale) => {
        const { cachedTranslations } = get()
        // Instantly switch to cached translations
        const cached = cachedTranslations[locale]
        set({
          locale,
          translations: cached || {},
          isLoaded: !!cached && Object.keys(cached).length > 0,
        })
        // Refresh in background
        get().fetchTranslations(locale)
      },

      fetchTranslations: async (locale?: 'en' | 'id') => {
        const targetLocale = locale || get().locale
        const { cachedTranslations } = get()

        set({ isLoading: true })

        try {
          const response = await apiClient.get(`/translations/${targetLocale}`)
          const newTranslations = response.data.data.translations || {}

          // Update both current translations and cache
          const updatedCache = {
            ...cachedTranslations,
            [targetLocale]: newTranslations,
          }

          set({
            translations: newTranslations,
            cachedTranslations: updatedCache,
            isLoading: false,
            isLoaded: true,
          })
        } catch (error) {
          console.error('Failed to fetch translations:', error)
          set({ isLoading: false })
        }
      },

      // Preload both locales on app start
      preloadTranslations: async () => {
        const { cachedTranslations, locale } = get()

        // Load missing translations in parallel
        const promises: Promise<void>[] = []

        if (!cachedTranslations.id || Object.keys(cachedTranslations.id).length === 0) {
          promises.push(
            apiClient.get('/translations/id')
              .then(res => res.data.data.translations || {})
              .then(trans => {
                set(state => ({
                  cachedTranslations: { ...state.cachedTranslations, id: trans }
                }))
              })
              .catch(() => {})
          )
        }

        if (!cachedTranslations.en || Object.keys(cachedTranslations.en).length === 0) {
          promises.push(
            apiClient.get('/translations/en')
              .then(res => res.data.data.translations || {})
              .then(trans => {
                set(state => ({
                  cachedTranslations: { ...state.cachedTranslations, en: trans }
                }))
              })
              .catch(() => {})
          )
        }

        // Wait for all to complete
        await Promise.all(promises)

        // Set current locale translations as active
        const currentCached = get().cachedTranslations[locale]
        if (currentCached && Object.keys(currentCached).length > 0) {
          set({
            translations: currentCached,
            isLoaded: true,
          })
        } else {
          // Fallback: fetch current locale
          get().fetchTranslations()
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
      partialize: (state) => ({
        locale: state.locale,
        cachedTranslations: state.cachedTranslations,
      }),
    }
  )
)
