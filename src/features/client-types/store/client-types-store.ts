/**
 * Client Types Store
 * Zustand state management for client types
 */
import { create } from 'zustand'
import type {
  ClientType,
  ClientTypeSelectOption,
  ClientTypesFilters,
  ClientTypesPagination,
  CreateClientTypePayload,
  UpdateClientTypePayload,
} from '../types/client-types.types'
import { clientTypesApi } from '../api/client-types-api'

interface ClientTypesState {
  // State
  items: ClientType[]
  selectedItem: ClientType | null
  selectOptions: ClientTypeSelectOption[]
  isLoading: boolean
  isLoadingSelectOptions: boolean
  isSubmitting: boolean
  error: string | null
  filters: ClientTypesFilters
  pagination: ClientTypesPagination

  // Actions
  fetchClientTypes: (params?: ClientTypesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  fetchSelectOptions: () => Promise<void>
  create: (payload: CreateClientTypePayload) => Promise<void>
  update: (id: number, payload: UpdateClientTypePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ClientTypesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ClientTypesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ClientTypesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useClientTypesStore = create<ClientTypesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  selectOptions: [],
  isLoading: false,
  isLoadingSelectOptions: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchClientTypes: async (params?: ClientTypesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await clientTypesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch client types'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await clientTypesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch client type'
      set({ error: message, isLoading: false })
    }
  },

  fetchSelectOptions: async () => {
    set({ isLoadingSelectOptions: true })

    try {
      const response = await clientTypesApi.getSelectOptions()
      set({
        selectOptions: response.data,
        isLoadingSelectOptions: false,
      })
    } catch {
      set({ selectOptions: [], isLoadingSelectOptions: false })
    }
  },

  create: async (payload: CreateClientTypePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientTypesApi.create(payload)
      set({ isSubmitting: false })
      await get().fetchClientTypes()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create client type'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateClientTypePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientTypesApi.update(id, payload)
      set({ isSubmitting: false })
      await get().fetchClientTypes()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update client type'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientTypesApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchClientTypes()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete client type'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientTypesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      await get().fetchClientTypes()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete client types'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ClientTypesFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  resetForm: () => {
    set({
      selectedItem: null,
      selectOptions: [],
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
