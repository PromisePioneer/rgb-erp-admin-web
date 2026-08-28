/**
 * Invoices Store
 * Zustand state management for invoices
 */
import { create } from 'zustand'
import type {
  Invoice,
  InvoiceDetail,
  InvoiceFilters,
  InvoicePagination,
  CreateInvoicePayload,
} from '../types/invoices.types'
import { invoicesApi } from '../api/invoices-api'

interface InvoicesState {
  // State
  items: Invoice[]
  selectedItem: InvoiceDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: InvoiceFilters
  pagination: InvoicePagination

  // Actions
  fetchInvoices: (params?: InvoiceFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateInvoicePayload) => Promise<void>
  markPaid: (id: number) => Promise<void>
  setFilters: (filters: Partial<InvoiceFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: InvoiceFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: InvoicePagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchInvoices: async (params?: InvoiceFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await invoicesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch invoices'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await invoicesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch invoice'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateInvoicePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await invoicesApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchInvoices()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create invoice'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  markPaid: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await invoicesApi.markPaid(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchInvoices()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to mark invoice as paid'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<InvoiceFilters>) => {
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
