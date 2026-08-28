/**
 * Accounts Store
 * Zustand state management for Chart of Accounts
 */
import { create } from 'zustand'
import type {
  Account,
  AccountsFilters,
  AccountsPagination,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../types/accounts.types'
import { accountsApi } from '../api/accounts-api'

interface AccountsState {
  // State
  items: Account[]
  selectedItem: Account | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: AccountsFilters
  pagination: AccountsPagination

  // Actions
  fetchAccounts: (params?: AccountsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateAccountPayload) => Promise<void>
  update: (id: number, payload: UpdateAccountPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<AccountsFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: AccountsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: AccountsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchAccounts: async (params?: AccountsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await accountsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch accounts'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await accountsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch account'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateAccountPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await accountsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateAccountPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await accountsApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await accountsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await accountsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchAccounts()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete accounts'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<AccountsFilters>) => {
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
