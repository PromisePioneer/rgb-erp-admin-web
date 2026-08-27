// Journal Entries Store (placeholder)
import { create } from 'zustand'

export const useJournalStore = create(() => ({
  entries: [],
  loading: false,
  error: null,
  filters: {},
  fetchEntries: async () => {},
  setFilters: () => {},
  create: async () => {},
  update: async () => {},
  remove: async () => {},
  post: async () => {},
  unpost: async () => {},
}))
