/**
 * Bank Accounts Store
 * Zustand state management for bank accounts
 */
import { create } from 'zustand'
import type {
  BankAccount,
  BankAccountsFilters,
  BankAccountsPagination,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from '../types/bank-accounts.types'
import { bankAccountsApi } from '../api/bank-accounts-api'

interface BankAccountsState {
  // State
  items: BankAccount[]
  selectedItem: BankAccount | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: BankAccountsFilters
  pagination: BankAccountsPagination

  // Actions
  fetchBankAccounts: (params?: BankAccountsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateBankAccountPayload) => Promise<void>
  update: (id: number, payload: UpdateBankAccountPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<BankAccountsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: BankAccountsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: BankAccountsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useBankAccountsStore = create<BankAccountsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchBankAccounts: async (params?: BankAccountsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await bankAccountsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch bank accounts'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await bankAccountsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch bank account'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateBankAccountPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await bankAccountsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBankAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create bank account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateBankAccountPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await bankAccountsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBankAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update bank account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await bankAccountsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBankAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete bank account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await bankAccountsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchBankAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete bank accounts'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<BankAccountsFilters>) => {
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
