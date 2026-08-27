/**
 * Journal Entries Store
 * Zustand state management for journal entries
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface JournalLine {
  id: number
  journal_entry_id: number
  account_id: number
  debit: number
  credit: number
  account?: {
    id: number
    code: string
    name: string
  }
}

export interface JournalEntry {
  id: number
  date: string
  reference: string | null
  description: string
  status: 'draft' | 'posted'
  source_type: string | null
  source_id: string | null
  created_by: number
  updated_by: number | null
  posted_by: number | null
  posted_at: string | null
  period_id: number | null
  lines: JournalLine[]
  created_at: string
  updated_at: string
}

interface JournalFilters {
  status?: string
  start_date?: string
  end_date?: string
  period_id?: number
}

interface JournalState {
  // State
  items: JournalEntry[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: JournalFilters

  // Actions
  fetchEntries: (filters?: JournalFilters) => Promise<void>
  postEntry: (id: number) => Promise<void>
  unpostEntry: (id: number) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  setFilters: (filters: JournalFilters) => void
  clearError: () => void
}

export const useJournalStore = create<JournalState>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: {},

  // Actions
  fetchEntries: async (filters?: JournalFilters) => {
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams()
      const currentFilters = filters ?? get().filters
      if (currentFilters.status && currentFilters.status !== 'all') {
        params.set('status', currentFilters.status)
      }
      if (currentFilters.start_date) {
        params.set('start_date', currentFilters.start_date)
      }
      if (currentFilters.end_date) {
        params.set('end_date', currentFilters.end_date)
      }
      params.set('per_page', '100')

      const { data } = await apiClient.get(`/admin/journal-entries?${params}`)
      const entries: JournalEntry[] = data.data || []
      set({ items: entries, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch journal entries'
      set({ error: message, isLoading: false })
    }
  },

  postEntry: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/journal-entries/${id}/post`)
      await get().fetchEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to post entry'
      set({ error: message, isSubmitting: false })
      throw error
    }
    set({ isSubmitting: false })
  },

  unpostEntry: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/journal-entries/${id}/unpost`)
      await get().fetchEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unpost entry'
      set({ error: message, isSubmitting: false })
      throw error
    }
    set({ isSubmitting: false })
  },

  deleteEntry: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.delete(`/admin/journal-entries/${id}`)
      await get().fetchEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete entry'
      set({ error: message, isSubmitting: false })
      throw error
    }
    set({ isSubmitting: false })
  },

  setFilters: (filters: JournalFilters) => {
    set({ filters })
    get().fetchEntries(filters)
  },

  clearError: () => {
    set({ error: null })
  },
}))
