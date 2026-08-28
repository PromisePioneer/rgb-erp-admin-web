/**
 * Roles Store
 * Zustand state management for roles
 */
import { create } from 'zustand'
import type {
  Role,
  RolesFilters,
  RolesPagination,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roles.types'
import { rolesApi } from '../api/roles-api'

interface RolesState {
  // State
  items: Role[]
  selectedItem: Role | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: RolesFilters
  pagination: RolesPagination

  // Actions
  fetchRoles: (params?: RolesFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateRolePayload) => Promise<void>
  update: (id: number, payload: UpdateRolePayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<RolesFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: RolesFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: RolesPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useRolesStore = create<RolesState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchRoles: async (params?: RolesFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await rolesApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch roles'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await rolesApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch role'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateRolePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await rolesApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchRoles()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create role'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateRolePayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await rolesApi.update(id, payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchRoles()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update role'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await rolesApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchRoles()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete role'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await rolesApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchRoles()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete roles'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<RolesFilters>) => {
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
