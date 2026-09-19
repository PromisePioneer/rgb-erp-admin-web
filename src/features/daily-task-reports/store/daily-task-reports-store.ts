/**
 * Daily Task Reports Store
 * Zustand state management for daily task reports (READ-ONLY + review)
 */
import { create } from 'zustand'
import type {
  DailyTaskReport,
  DailyTaskReportDetail,
  DailyTaskStats,
  ReportFilters,
  ReportPagination,
  AreaOption,
  EmployeeOption,
  ReviewCriteria,
  SubmitReviewPayload,
} from '../types/daily-task-reports.types'
import { dailyTaskReportsApi } from '../api/daily-task-reports-api'

interface DailyTaskReportsState {
  // State
  items: DailyTaskReport[]
  selectedItem: DailyTaskReportDetail | null
  stats: DailyTaskStats | null
  isLoading: boolean
  error: string | null
  filters: ReportFilters
  pagination: ReportPagination
  areas: AreaOption[]
  employees: EmployeeOption[]
  criteria: ReviewCriteria[]
  isSubmittingReview: boolean

  // Actions
  fetchReports: (params?: ReportFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  fetchStats: () => Promise<void>
  fetchAreas: () => Promise<void>
  fetchEmployees: () => Promise<void>
  fetchCriteria: () => Promise<void>
  submitReview: (id: number, payload: SubmitReviewPayload) => Promise<void>
  setFilters: (filters: Partial<ReportFilters>) => void
  resetFilters: () => void
  clearError: () => void
  clearSelection: () => void
  reset: () => void
}

const initialFilters: ReportFilters = {
  page: 1,
  per_page: 24,
}

const initialPagination: ReportPagination = {
  current_page: 1,
  per_page: 24,
  total: 0,
  last_page: 1,
}

const initialStats: DailyTaskStats = {
  total_tasks: 0,
  completed_tasks: 0,
  reviewed_tasks: 0,
  in_progress_tasks: 0,
  assigned_tasks: 0,
  month_average_rating: null,
}

export const useDailyTaskReportsStore = create<DailyTaskReportsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  areas: [],
  employees: [],
  criteria: [],
  isSubmittingReview: false,

  // Actions
  fetchReports: async (params?: ReportFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await dailyTaskReportsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })

      // Also fetch stats
      get().fetchStats()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch reports'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await dailyTaskReportsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report detail'
      set({ error: message, isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const { month, area_id, employee_id } = get().filters
      const response = await dailyTaskReportsApi.getStats({ month, area_id, employee_id })
      set({ stats: response.data })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      set({ stats: initialStats })
    }
  },

  fetchAreas: async () => {
    if (get().areas.length > 0) return

    try {
      const response = await dailyTaskReportsApi.getAreas()
      set({ areas: response.data })
    } catch (error) {
      console.error('Failed to fetch areas:', error)
    }
  },

  fetchEmployees: async () => {
    if (get().employees.length > 0) return

    try {
      const response = await dailyTaskReportsApi.getEmployees()
      set({ employees: response.data })
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  },

  fetchCriteria: async () => {
    if (get().criteria.length > 0) return

    try {
      const response = await dailyTaskReportsApi.getCriteria()
      set({ criteria: response.data })
    } catch (error) {
      console.error('Failed to fetch criteria:', error)
    }
  },

  submitReview: async (id: number, payload: SubmitReviewPayload) => {
    set({ isSubmittingReview: true, error: null })

    try {
      await dailyTaskReportsApi.submitReview(id, payload)
      // Refresh the detail view
      await get().fetchById(id)
      // Refresh the list to update average_rating
      await get().fetchReports()
      set({ isSubmittingReview: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit review'
      set({ error: message, isSubmittingReview: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ReportFilters>) => {
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

  clearError: () => {
    set({ error: null })
  },

  clearSelection: () => {
    set({ selectedItem: null })
  },

  reset: () => {
    set({
      items: [],
      selectedItem: null,
      stats: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,
      isSubmittingReview: false,
    })
  },
}))
