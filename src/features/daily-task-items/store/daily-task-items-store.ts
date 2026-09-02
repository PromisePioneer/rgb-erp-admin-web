/**
 * Daily Task Items Store
 */
import { create } from 'zustand'
import { dailyTaskItemsApi } from '../api/daily-task-items-api'
import type {
  DailyTaskItem,
  DailyTaskItemDetail,
  DailyTaskItemsFilters,
  CreateDailyTaskItem,
  UpdateDailyTaskItem,
  Pagination,
} from '../types/daily-task-items.types'

interface DailyTaskItemsState {
  // State
  items: DailyTaskItem[]
  selectedItem: DailyTaskItemDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: DailyTaskItemsFilters
  pagination: Pagination

  // Actions
  fetchItems: (params?: DailyTaskItemsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateDailyTaskItem) => Promise<void>
  update: (id: number, payload: UpdateDailyTaskItem) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<DailyTaskItemsFilters>) => void
  resetFilters: () => void
  clearError: () => void
}

const defaultPagination: Pagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

const defaultFilters: DailyTaskItemsFilters = {
  search: '',
  status: undefined,
  page: 1,
  per_page: 15,
}

export const useDailyTaskItemsStore = create<DailyTaskItemsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: defaultFilters,
  pagination: defaultPagination,

  // Actions
  fetchItems: async (params?: DailyTaskItemsFilters) => {
    set({ isLoading: true, error: null })
    try {
      const filters = params || get().filters
      const response = await dailyTaskItemsApi.getList(filters)
      if (response.success) {
        set({
          items: response.data,
          pagination: response.meta || defaultPagination,
          filters,
        })
      } else {
        set({ error: response.error || 'Failed to fetch items' })
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message || 'An error occurred' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await dailyTaskItemsApi.getById(id)
      if (response.success) {
        set({ selectedItem: response.data })
      } else {
        set({ error: response.error || 'Failed to fetch item' })
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message || 'An error occurred' })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload: CreateDailyTaskItem) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await dailyTaskItemsApi.create(payload)
      if (response.success) {
        await get().fetchItems()
      } else {
        set({ error: response.error || 'Failed to create item' })
        throw new Error(response.error)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  update: async (id: number, payload: UpdateDailyTaskItem) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await dailyTaskItemsApi.update(id, payload)
      if (response.success) {
        await get().fetchItems()
      } else {
        set({ error: response.error || 'Failed to update item' })
        throw new Error(response.error)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await dailyTaskItemsApi.delete(id)
      if (response.success) {
        await get().fetchItems()
      } else {
        set({ error: response.error || 'Failed to delete item' })
        throw new Error(response.error)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await dailyTaskItemsApi.bulkDelete(ids)
      if (response.success) {
        await get().fetchItems()
      } else {
        set({ error: response.error || 'Failed to bulk delete items' })
        throw new Error(response.error)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  setFilters: (filters: Partial<DailyTaskItemsFilters>) => {
    set({ filters: { ...get().filters, ...filters, page: filters.page || 1 } })
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  },

  clearError: () => {
    set({ error: null })
  },
}))
