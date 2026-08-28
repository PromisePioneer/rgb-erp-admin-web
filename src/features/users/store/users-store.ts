/**
 * Users Store
 * Zustand state management for users
 */
import { create } from 'zustand'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UsersFilters,
  UsersPagination,
} from '../types/users.types'
import { usersApi } from '../api/users-api'

interface UsersState {
  // State
  items: User[]
  selectedItem: User | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: UsersFilters
  pagination: UsersPagination

  // Actions
  fetchUsers: (params?: UsersFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateUserPayload) => Promise<void>
  update: (id: number, payload: UpdateUserPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<UsersFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: UsersFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: UsersPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchUsers: async (params?: UsersFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await usersApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch users'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await usersApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch user'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateUserPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await usersApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchUsers()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create user'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateUserPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await usersApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchUsers()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await usersApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchUsers()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await usersApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchUsers()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete users'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<UsersFilters>) => {
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
