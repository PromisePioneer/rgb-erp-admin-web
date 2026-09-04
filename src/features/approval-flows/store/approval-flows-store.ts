/**
 * Approval Flows Store
 * Zustand state management for approval flows
 */
import { create } from 'zustand'
import type {
  ApprovalFlow,
  UpdateApprovalFlowPayload,
  SelectOption,
} from '../types/approval-flows.types'
import { approvalFlowsApi } from '../api/approval-flows-api'

interface ApprovalFlowsState {
  // State
  items: ApprovalFlow[]
  selectedFlow: ApprovalFlow | null
  usersOptions: SelectOption[]
  rolesOptions: SelectOption[]
  positionsOptions: SelectOption[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchFlows: () => Promise<void>
  fetchByType: (type: string) => Promise<void>
  fetchUsersOptions: () => Promise<void>
  fetchRolesOptions: () => Promise<void>
  fetchPositionsOptions: () => Promise<void>
  updateFlow: (type: string, payload: UpdateApprovalFlowPayload) => Promise<void>
  clearError: () => void
}

export const useApprovalFlowsStore = create<ApprovalFlowsState>((set, get) => ({
  // Initial state
  items: [],
  selectedFlow: null,
  usersOptions: [],
  rolesOptions: [],
  positionsOptions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  fetchFlows: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await approvalFlowsApi.getList()
      set({
        items: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch approval flows'
      set({ error: message, isLoading: false })
    }
  },

  fetchByType: async (type: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await approvalFlowsApi.getByType(type)
      set({
        selectedFlow: response.data,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch approval flow'
      set({ error: message, isLoading: false })
    }
  },

  fetchUsersOptions: async () => {
    try {
      const response = await approvalFlowsApi.getUsersOptions()
      set({ usersOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch users options:', error)
    }
  },

  fetchRolesOptions: async () => {
    try {
      const response = await approvalFlowsApi.getRolesOptions()
      set({ rolesOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch roles options:', error)
    }
  },

  fetchPositionsOptions: async () => {
    try {
      const response = await approvalFlowsApi.getPositionsOptions()
      set({ positionsOptions: response.data })
    } catch (error) {
      console.error('Failed to fetch positions options:', error)
    }
  },

  updateFlow: async (type: string, payload: UpdateApprovalFlowPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      const response = await approvalFlowsApi.update(type, payload)
      set({ selectedFlow: response.data, isSubmitting: false })
      // Refresh the list
      await get().fetchFlows()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update approval flow'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
