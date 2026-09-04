/**
 * Approval Types API (Flat Structure)
 * Single request for Type + Steps
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApprovalType,
  ApprovalTypeDetail,
  ApprovalTypePayload,
  PositionOption,
  RoleOption,
  EmployeeOption,
} from '../types/approval-types.types'

export const approvalTypesApi = {
  // === Approval Types CRUD ===

  /**
   * Get all approval types
   */
  getList: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: ApprovalType[] }>(
      '/admin/approval-types'
    )
    return data
  },

  /**
   * Get single approval type with full steps
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<{ success: boolean; data: ApprovalTypeDetail }>(
      `/admin/approval-types/${id}`
    )
    return data
  },

  /**
   * Create approval type WITH steps (single request)
   */
  create: async (payload: ApprovalTypePayload) => {
    const { data } = await apiClient.post<{ success: boolean; data: ApprovalTypeDetail }>(
      '/admin/approval-types',
      payload
    )
    return data
  },

  /**
   * Update approval type AND steps (single request)
   */
  update: async (id: number, payload: ApprovalTypePayload) => {
    const { data } = await apiClient.put<{ success: boolean; data: ApprovalTypeDetail }>(
      `/admin/approval-types/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete approval type
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/approval-types/${id}`)
  },

  /**
   * Get active types for dropdown
   */
  getActive: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: { id: number; type: string; name: string }[] }>(
      '/admin/approval-types/active'
    )
    return data
  },

  // === Options ===

  /**
   * Get positions for dropdown (Mobile/Jabatan context)
   * Returns company_name for display: "DANRU (NON SATPAM)"
   */
  getPositionsOptions: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: PositionOption[] }>(
      '/admin/approval-types/options/positions'
    )
    return data
  },

  /**
   * Get roles for dropdown (Website/Role context)
   */
  getRolesOptions: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: RoleOption[] }>(
      '/admin/approval-types/options/roles'
    )
    return data
  },

  /**
   * Get employees for dropdown (specific users)
   */
  getEmployeesOptions: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: EmployeeOption[] }>(
      '/admin/approval-types/options/employees'
    )
    return data
  },
}
