/**
 * Translation Hook
 * Easy access to translation store
 */
import { useTranslationStore } from '@/stores/translation-store'

export function useTranslation() {
  const { t, locale, setLocale, translations, isLoading, isLoaded, fetchTranslations } =
    useTranslationStore()

  return {
    t,
    locale,
    setLocale,
    translations,
    isLoading,
    isLoaded,
    fetchTranslations,
  }
}
