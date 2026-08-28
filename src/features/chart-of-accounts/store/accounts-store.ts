/**
 * Accounts Store (Chart of Accounts)
 * Zustand state management for accounts
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

export interface Account {
  id: number
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_id: number | null
  is_header: boolean
  normal_balance: 'debit' | 'credit'
  is_active: boolean
  level: number
  is_deleted?: boolean
  deleted_at?: string
  children?: Account[]
  created_at?: string
  updated_at?: string
}

interface AccountsFilters {
  type?: string
  search?: string
  with_trashed?: boolean
}

interface AccountsState {
  // State
  items: Account[]
  selectedAccount: Account | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: AccountsFilters

  // Actions
  fetchAccounts: (filters?: AccountsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (data: Partial<Account>) => Promise<Account>
  update: (id: number, data: Partial<Account>) => Promise<void>
  softDelete: (id: number) => Promise<void>
  restore: (id: number) => Promise<void>
  setFilters: (filters: AccountsFilters) => void
  clearError: () => void
  resetForm: () => void
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  // Initial state
  items: [],
  selectedAccount: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: {},

  // Actions
  fetchAccounts: async (filters?: AccountsFilters) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      const currentFilters = filters ?? get().filters
      if (currentFilters.type && currentFilters.type !== 'all') {
        params.set('type', currentFilters.type)
      }
      if (currentFilters.search) {
        params.set('search', currentFilters.search)
      }
      if (currentFilters.with_trashed) {
        params.set('with_trashed', 'true')
      }

      const { data } = await apiClient.get(`/admin/accounts?${params}`)
      const accounts: Account[] = data.data || []

      // Build tree structure
      const tree = buildTree(accounts)
      set({ items: tree, isLoading: false, filters: currentFilters })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch accounts'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedAccount: null })
    try {
      const { data } = await apiClient.get(`/admin/accounts/${id}`)
      set({ selectedAccount: data.data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch account'
      set({ error: message, isLoading: false })
    }
  },

  create: async (formData: Partial<Account>) => {
    set({ isSubmitting: true, error: null })
    try {
      const { data } = await apiClient.post('/admin/accounts', formData)
      await get().fetchAccounts()
      set({ isSubmitting: false })
      return data.data as Account
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, formData: Partial<Account>) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.put(`/admin/accounts/${id}`, formData)
      await get().fetchAccounts()
      set({ isSubmitting: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  softDelete: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.delete(`/admin/accounts/${id}`)
      await get().fetchAccounts({ ...get().filters, with_trashed: true })
      set({ isSubmitting: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  restore: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      await apiClient.post(`/admin/accounts/${id}/restore`)
      await get().fetchAccounts({ ...get().filters, with_trashed: true })
      set({ isSubmitting: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore account'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (filters: AccountsFilters) => {
    set({ filters })
  },

  clearError: () => {
    set({ error: null })
  },

  resetForm: () => {
    set({ selectedAccount: null, error: null })
  },
}))

function buildTree(accounts: Account[]): Account[] {
  const map = new Map<number, Account>()
  const roots: Account[] = []

  accounts.forEach(acc => {
    map.set(acc.id, { ...acc, children: [] })
  })

  map.forEach(acc => {
    if (acc.parent_id && map.has(acc.parent_id)) {
      const parent = map.get(acc.parent_id)!
      parent.children = parent.children || []
      parent.children.push(acc)
    } else if (!acc.parent_id) {
      roots.push(acc)
    }
  })

  const sortByCode = (a: Account, b: Account) => a.code.localeCompare(b.code)
  roots.sort(sortByCode)
  const sortChildren = (items: Account[]) => {
    items.sort(sortByCode)
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortChildren(item.children)
      }
    })
  }
  sortChildren(roots)

  return roots
}
