/**
 * Approval Types Store (Flat Structure)
 * Zustand state management for approval types with inline steps
 */
import { create } from 'zustand'
import type {
  ApprovalType,
  ApprovalTypeDetail,
  ApprovalTypePayload,
  PositionOption,
  EmployeeOption,
} from '../types/approval-types.types'
import { approvalTypesApi } from '../api/approval-types-api'

interface ApprovalTypesState {
  // Types state
  items: ApprovalType[]
  selectedType: ApprovalTypeDetail | null

  // Options for dropdowns
  positionsOptions: PositionOption[]
  employeesOptions: EmployeeOption[]

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchTypes: () => Promise<void>
  fetchTypeById: (id: number) => Promise<void>
  saveType: (payload: ApprovalTypePayload, id?: number) => Promise<void>
  deleteType: (id: number) => Promise<void>

  // Actions - Options
  fetchPositionsOptions: () => Promise<void>
  fetchEmployeesOptions: () => Promise<void>

  // Helpers
  clearError: () => void
  clearSelected: () => void
}

export const useApprovalTypesStore = create<ApprovalTypesState>((set, get) => ({
  // Initial state
  items: [],
  selectedType: null,
  positionsOptions: [],
  employeesOptions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  // === Types Actions ===
  fetchTypes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await approvalTypesApi.getList()
      set({ items: response.data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch approval types'
      set({ error: message, isLoading: false })
    }
  },

  fetchTypeById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await approvalTypesApi.getById(id)
      set({ selectedType: response.data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch approval type'
      set({ error: message, isLoading: false })
    }
  },

  saveType: async (payload, id) => {
    set({ isSubmitting: true, error: null })
    try {
      if (id) {
        // Update
        await approvalTypesApi.update(id, payload)
      } else {
        // Create
        await approvalTypesApi.create(payload)
      }
      set({ isSubmitting: false })
      await get().fetchTypes()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save approval type'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  deleteType: async (id) => {
    set({ isSubmitting: true, error: null })
    try {
      await approvalTypesApi.delete(id)
      set({ isSubmitting: false })
      await get().fetchTypes()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete approval type'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  // === Options Actions ===
  fetchPositionsOptions: async () => {
    try {
      const response = await approvalTypesApi.getPositionsOptions()
      set({ positionsOptions: response.data })
    } catch {
      set({ positionsOptions: [] })
    }
  },

  fetchEmployeesOptions: async () => {
    try {
      const response = await approvalTypesApi.getEmployeesOptions()
      set({ employeesOptions: response.data })
    } catch {
      set({ employeesOptions: [] })
    }
  },

  // === Helpers ===
  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedType: null }),
}))
