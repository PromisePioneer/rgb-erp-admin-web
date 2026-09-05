/**
 * Settings Store
 * Zustand state management for settings
 */
import { create } from 'zustand'
import type { Settings, UpdateSettingsPayloadWithFiles } from '../types/settings.types'
import { settingsApi } from '../api/settings-api'

interface SettingsState {
  // State
  data: Settings | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchSettings: () => Promise<void>
  updateSettings: (payload: UpdateSettingsPayloadWithFiles) => Promise<void>
  reset: () => void
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  data: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  fetchSettings: async () => {
    set({ isLoading: true, error: null })

    try {
      const result = await settingsApi.get()
      set({ data: result, isLoading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch settings'
      set({ error: message, isLoading: false })
    }
  },

  updateSettings: async (payload: UpdateSettingsPayloadWithFiles) => {
    set({ isSubmitting: true, error: null })

    try {
      const result = await settingsApi.update(payload)
      set({ data: result, isSubmitting: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update settings'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  reset: () => {
    set({ data: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
