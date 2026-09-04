/**
 * Checkpoints Store
 * Zustand state management for checkpoints
 */
import { create } from 'zustand'
import type {
  Checkpoint,
  CheckpointDetail,
  CheckpointsFilters,
  CheckpointsPagination,
  CreateCheckpointPayload,
  UpdateCheckpointPayload,
  AreaOption,
} from '../types/checkpoints.types'
import { checkpointsApi } from '../api/checkpoints-api'

interface CheckpointsState {
  // State
  items: Checkpoint[]
  selectedItem: CheckpointDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: CheckpointsFilters
  pagination: CheckpointsPagination
  areasOptions: AreaOption[]

  // Actions
  fetchCheckpoints: (params?: CheckpointsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  create: (payload: CreateCheckpointPayload) => Promise<void>
  update: (id: number, payload: UpdateCheckpointPayload) => Promise<void>
  remove: (id: number) => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<CheckpointsFilters>) => void
  resetFilters: () => void
  fetchAreasOptions: () => Promise<void>
  fetchNextSequence: (areaId: number) => Promise<number>
  regenerateSecret: (id: number) => Promise<string | null>
  clearError: () => void
  reset: () => void
}

const initialFilters: CheckpointsFilters = {
  page: 1,
  per_page: 15,
}

const initialPagination: CheckpointsPagination = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export const useCheckpointsStore = create<CheckpointsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  areasOptions: [],

  // Actions
  fetchCheckpoints: async (params?: CheckpointsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await checkpointsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch checkpoints'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await checkpointsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch checkpoint'
      set({ error: message, isLoading: false })
    }
  },

  create: async (payload: CreateCheckpointPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await checkpointsApi.create(payload)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchCheckpoints({ page: 1 })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create checkpoint'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  update: async (id: number, payload: UpdateCheckpointPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      const response = await checkpointsApi.update(id, payload)
      set({
        selectedItem: response.data as CheckpointDetail,
        isSubmitting: false,
      })
      // Refresh the list
      await get().fetchCheckpoints(get().filters)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update checkpoint'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await checkpointsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchCheckpoints(get().filters)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete checkpoint'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isSubmitting: true, error: null })

    try {
      await checkpointsApi.bulkDelete(ids)
      set({ isSubmitting: false })
      // Refresh the list
      await get().fetchCheckpoints(get().filters)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete checkpoints'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<CheckpointsFilters>) => {
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

  fetchAreasOptions: async () => {
    try {
      const response = await checkpointsApi.getAreasOptions()
      set({ areasOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch areas options:', error)
    }
  },

  fetchNextSequence: async (areaId: number) => {
    try {
      const response = await checkpointsApi.getNextSequence(areaId)
      return response.data.sequence
    } catch (error) {
      console.error('Failed to fetch next sequence:', error)
      return 1
    }
  },

  regenerateSecret: async (id: number) => {
    try {
      const response = await checkpointsApi.regenerateSecret(id)
      return response.data.secret_key
    } catch (error) {
      console.error('Failed to regenerate secret:', error)
      return null
    }
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set({
      items: [],
      selectedItem: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,
    })
  },
}))
