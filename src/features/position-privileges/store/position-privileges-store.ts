/**
 * Position Privileges Store
 * Zustand state management for position mobile privileges
 */
import { create } from 'zustand'
import type {
  MobilePrivilege,
  Position,
  UpdatePrivilegesPayload,
} from '../types/position-privileges.types'
import { positionPrivilegesApi } from '../api/position-privileges-api'

interface PositionPrivilegesState {
  // State
  position: Position | null
  mobilePrivileges: MobilePrivilege[]
  privilegeStatus: Record<number, number>
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchPrivileges: (positionId: number) => Promise<void>
  updatePrivileges: (positionId: number, payload: UpdatePrivilegesPayload) => Promise<void>
  togglePrivilege: (privilegeId: number) => void
  reset: () => void
  clearError: () => void
}

const initialState = {
  position: null,
  mobilePrivileges: [],
  privilegeStatus: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
}

export const usePositionPrivilegesStore = create<PositionPrivilegesState>((set, get) => ({
  ...initialState,

  fetchPrivileges: async (positionId: number) => {
    set({ isLoading: true, error: null })

    try {
      const response = await positionPrivilegesApi.getPrivileges(positionId)
      set({
        position: response.position,
        mobilePrivileges: response.mobile_privileges,
        privilegeStatus: response.privilege_status,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch privileges'
      set({ error: message, isLoading: false })
    }
  },

  updatePrivileges: async (positionId: number, payload: UpdatePrivilegesPayload) => {
    set({ isSubmitting: true, error: null })

    try {
      await positionPrivilegesApi.updatePrivileges(positionId, payload)
      set({ isSubmitting: false })
      // Refresh to get updated data
      await get().fetchPrivileges(positionId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update privileges'
      set({ error: message, isSubmitting: false })
      throw error
    }
  },

  togglePrivilege: (privilegeId: number) => {
    const { privilegeStatus } = get()
    const currentStatus = privilegeStatus[privilegeId] || 0
    const newStatus = currentStatus === 1 ? 0 : 1

    set({
      privilegeStatus: {
        ...privilegeStatus,
        [privilegeId]: newStatus,
      },
    })
  },

  reset: () => {
    set(initialState)
  },

  clearError: () => {
    set({ error: null })
  },
}))
