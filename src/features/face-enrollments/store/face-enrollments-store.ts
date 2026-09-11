/**
 * Face Enrollments Store
 * Zustand state management for face enrollments
 */
import { create } from 'zustand'
import type {
  FaceEnrollment,
  FaceEnrollmentFilters,
  FaceEnrollmentPagination,
} from '../types/face-enrollments.types'
import { faceEnrollmentsApi } from '../api/face-enrollments-api'

interface FaceEnrollmentsState {
  // State
  items: FaceEnrollment[]
  selectedItem: FaceEnrollment | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filters: FaceEnrollmentFilters
  pagination: FaceEnrollmentPagination

  // Actions
  fetchEnrollments: (params?: FaceEnrollmentFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  setFilters: (filters: Partial<FaceEnrollmentFilters>) => void
  resetFilters: () => void
  resetForm: () => void
  clearError: () => void
}

const initialFilters: FaceEnrollmentFilters = {
  page: 1,
  per_page: 25,
}

const initialPagination: FaceEnrollmentPagination = {
  current_page: 1,
  per_page: 25,
  total: 0,
  last_page: 1,
}

export const useFaceEnrollmentsStore = create<FaceEnrollmentsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchEnrollments: async (params?: FaceEnrollmentFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await faceEnrollmentsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch face enrollments'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await faceEnrollmentsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch face enrollment'
      set({ error: message, isLoading: false })
    }
  },

  remove: async (id: number) => {
    set({ isSubmitting: true, error: null })

    try {
      await faceEnrollmentsApi.delete(id)
      set({ isSubmitting: false })
      // Refresh list
      await get().fetchEnrollments()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete face enrollment'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<FaceEnrollmentFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
    if (!('page' in newFilters)) {
      updatedFilters.page = 1
    }
    set({ filters: updatedFilters })
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  resetForm: () => {
    set({ selectedItem: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
