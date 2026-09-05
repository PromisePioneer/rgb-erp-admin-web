/**
 * Patrol Reports Store
 * Zustand state management for patrol reports (READ-ONLY)
 */
import { create } from 'zustand'
import type {
  PatrolSession,
  PatrolSessionDetail,
  PatrolReportsFilters,
  PatrolReportsPagination,
  PatrolStats,
  ProjectOption,
} from '../types/patrol-reports.types'
import { patrolReportsApi } from '../api/patrol-reports-api'

interface PatrolReportsState {
  // State
  items: PatrolSession[]
  selectedItem: PatrolSessionDetail | null
  stats: PatrolStats | null
  isLoading: boolean
  error: string | null
  filters: PatrolReportsFilters
  pagination: PatrolReportsPagination
  projects: ProjectOption[]

  // Actions
  fetchSessions: (params?: PatrolReportsFilters) => Promise<void>
  fetchById: (sessionId: number) => Promise<void>
  fetchStats: () => Promise<void>
  fetchProjects: () => Promise<void>
  bulkDelete: (ids: number[]) => Promise<void>
  setFilters: (filters: Partial<PatrolReportsFilters>) => void
  resetFilters: () => void
  clearError: () => void
  reset: () => void
}

const initialFilters: PatrolReportsFilters = {
  page: 1,
  per_page: 24,
}

const initialPagination: PatrolReportsPagination = {
  current_page: 1,
  per_page: 24,
  total: 0,
  last_page: 1,
}

const initialStats: PatrolStats = {
  total_sessions: 0,
  completed: 0,
  in_progress: 0,
  incomplete: 0,
  failed: 0,
  avg_completion_time: '00:00:00',
  invalid_sequences: 0,
}

export const usePatrolReportsStore = create<PatrolReportsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  projects: [],

  // Actions
  fetchSessions: async (params?: PatrolReportsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await patrolReportsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })

      // Also fetch stats
      get().fetchStats()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch patrol reports'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (sessionId: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await patrolReportsApi.getById(sessionId)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch patrol session'
      set({ error: message, isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const { month, project_id, employee_id } = get().filters
      const response = await patrolReportsApi.getStats({ month, project_id, employee_id })
      set({ stats: response.data })
    } catch (error) {
      console.error('Failed to fetch patrol stats:', error)
      set({ stats: initialStats })
    }
  },

  fetchProjects: async () => {
    try {
      const response = await patrolReportsApi.getProjects()
      set({ projects: response.data })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isLoading: true, error: null })
    try {
      await patrolReportsApi.bulkDelete(ids)
      await get().fetchSessions()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete patrol sessions'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<PatrolReportsFilters>) => {
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

  reset: () => {
    set({
      items: [],
      selectedItem: null,
      stats: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,
    })
  },
}))
