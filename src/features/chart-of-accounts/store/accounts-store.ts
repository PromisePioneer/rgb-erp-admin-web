import { create } from 'zustand'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/accounts-api'
import type { Account } from '../types/account.types'

interface State {
  accounts: Account[]
  loading: boolean
  error: string | null
  filters: Record<string, any>
  fetchAccounts: () => Promise<void>
  setFilters: (f: Record<string, any>) => void
  create: (data: Partial<Account>) => Promise<void>
  update: (id: number, data: Partial<Account>) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useAccountsStore = create<State>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  filters: {},

  fetchAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getAccounts(get().filters)
      set({ accounts: data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters })
    get().fetchAccounts()
  },

  create: async (data) => {
    set({ loading: true })
    await createAccount(data)
    await get().fetchAccounts()
  },

  update: async (id, data) => {
    set({ loading: true })
    await updateAccount(id, data)
    await get().fetchAccounts()
  },

  remove: async (id) => {
    set({ loading: true })
    await deleteAccount(id)
    await get().fetchAccounts()
  },
}))
