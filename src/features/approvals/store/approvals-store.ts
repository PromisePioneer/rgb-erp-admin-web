/**
 * Approvals Store
 * Zustand state management for approvals
 */
import { create } from 'zustand'
import type {
  Approval,
  ApprovalDetail,
  ApprovalsFilters,
  ApprovalsPagination,
  ApprovalActPayload,
} from '../types/approvals.types'
import { approvalsApi } from '../api/approvals-api'

interface ApprovalsState {
  // State
  items: Approval[]
  selectedItem: ApprovalDetail | null
  isLoading: boolean
  isActing: boolean
  error: string | null
  filters: ApprovalsFilters
  pagination: ApprovalsPagination

  // Actions
  fetchApprovals: (params?: ApprovalsFilters) => Promise<void>
  fetchById: (id: number) => Promise<void>
  act: (id: number, payload: ApprovalActPayload) => Promise<void>
  setFilters: (filters: Partial<ApprovalsFilters>) => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters: ApprovalsFilters = {
  page: 1,
  per_page: 50,
}

const initialPagination: ApprovalsPagination = {
  current_page: 1,
  per_page: 50,
  total: 0,
  last_page: 1,
}

export const useApprovalsStore = create<ApprovalsState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  isLoading: false,
  isActing: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Actions
  fetchApprovals: async (params?: ApprovalsFilters) => {
    set({ isLoading: true, error: null })

    try {
      const currentFilters = { ...get().filters, ...params }
      const response = await approvalsApi.getList(currentFilters)

      set({
        items: response.data,
        pagination: response.meta ?? get().pagination,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch approvals'
      set({ error: message, isLoading: false })
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null, selectedItem: null })

    try {
      const response = await approvalsApi.getById(id)
      set({
        selectedItem: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch approval'
      set({ error: message, isLoading: false })
    }
  },

  act: async (id: number, payload: ApprovalActPayload) => {
    set({ isActing: true, error: null })

    try {
      await approvalsApi.act(id, payload)
      set({ isActing: false })
      // Refresh the list
      await get().fetchApprovals()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process approval'
      set({ error: message, isActing: false })
      throw error
    }
  },

  setFilters: (newFilters: Partial<ApprovalsFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters }
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
}))
