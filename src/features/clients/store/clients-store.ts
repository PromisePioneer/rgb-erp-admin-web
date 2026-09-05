/**
 * Clients Store
 * Zustand state management for clients
 */
import { create } from 'zustand'
import type {
  Client,
  ClientDetail,
  ClientsFilters,
  ClientsPagination,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/clients.types'
import { clientsApi } from '../api/clients-api'

interface ClientsState {
  // State
  items: Client[]
  selectedItem: ClientDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: ClientsFilters
  pagination: ClientsPagination

  // Actions
  fetchClients: (params?: ClientsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateClientPayload) => Promise<void>
  update: (id: number, payload: UpdateClientPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<ClientsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: ClientsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: ClientsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchClients: async (params?: ClientsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await clientsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch clients'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await clientsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch client'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateClientPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchClients()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create client'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateClientPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchClients()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update client'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchClients()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete client'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await clientsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchClients()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete clients'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ClientsFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    // Reset to page 1 when changing filters (except page itself)
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
      error: null,
    })
  },


  clearError: () => {
    set({ error: null })
  },
}))
