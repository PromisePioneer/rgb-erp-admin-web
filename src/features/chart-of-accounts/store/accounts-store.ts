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
  children?: Account[]
  created_at?: string
  updated_at?: string
}

interface AccountsFilters {
  type?: string
  search?: string
}

interface AccountsState {
  // State
  items: Account[]
  isLoading: boolean
  error: string | null
  filters: AccountsFilters

  // Actions
  fetchAccounts: (filters?: AccountsFilters) => Promise<void>
  setFilters: (filters: AccountsFilters) => void
  clearError: () => void
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
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

      const { data } = await apiClient.get(`/admin/accounts?${params}`)
      const accounts: Account[] = data.data || []

      // Build tree structure
      const tree = buildTree(accounts)
      set({ items: tree, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch accounts'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (filters: AccountsFilters) => {
    set({ filters })
    get().fetchAccounts(filters)
  },

  clearError: () => {
    set({ error: null })
  },
}))

function buildTree(accounts: Account[]): Account[] {
  const map = new Map<number, Account>()
  const roots: Account[] = []

  // First pass: create map with empty children arrays
  accounts.forEach(acc => {
    map.set(acc.id, { ...acc, children: [] })
  })

  // Second pass: build tree
  map.forEach(acc => {
    if (acc.parent_id && map.has(acc.parent_id)) {
      const parent = map.get(acc.parent_id)!
      parent.children = parent.children || []
      parent.children.push(acc)
    } else if (!acc.parent_id) {
      roots.push(acc)
    }
  })

  // Sort by code
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
