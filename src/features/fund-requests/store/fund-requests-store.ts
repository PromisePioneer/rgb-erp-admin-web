import { create } from 'zustand'
import { fundRequestsApi } from '../api/fund-requests-api'
import type { FundRequest, FundRequestDetail, FundRequestFilters } from '../types/fund-requests.types'

interface State {
  items: FundRequest[]
  selectedItem: FundRequestDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: FundRequestFilters
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

interface Actions {
  fetchFundRequests: (params?: FundRequestFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: any) => Promise<void>
  update: (id: number, payload: any) => Promise<void>
  submitForApproval: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  setFilters: (filters: Partial<FundRequestFilters>) => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters: FundRequestFilters = { page: 1, per_page: 15 }
const initialPagination = { current_page: 1, per_page: 15, total: 0, last_page: 1 }

export const useFundRequestsStore = create<State & Actions>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  fetchFundRequests: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const merged = { ...get().filters, ...params }
      const response = await fundRequestsApi.getList(merged)
      set({
        items: response.data as FundRequest[],
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fundRequestsApi.getById(id)
      set({ selectedItem: response.data as FundRequestDetail, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  create: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      await fundRequestsApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchFundRequests()
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false })
      throw err
    }
  },

  update: async (id, payload) => {
    set({ isSubmitting: true, error: null })
    try {
      await fundRequestsApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchFundRequests()
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false })
      throw err
    }
  },

  submitForApproval: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await fundRequestsApi.submitForApproval(id)
      set({ isSubmitting: false })
      await get().fetchFundRequests()
      await get().fetchById(id)
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false })
      throw err
    }
  },

  remove: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await fundRequestsApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchFundRequests()
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false })
      throw err
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  resetFilters: () => set({ filters: initialFilters }),
  clearError: () => set({ error: null }),
}))
