/**
 * Approval Flows API
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApprovalFlow,
  UpdateApprovalFlowPayload,
  SelectOption,
  ApiResponse,
} from '../types/approval-flows.types'

export const approvalFlowsApi = {
  /**
   * Get all approval flows
   */
  getList: async () => {
    const { data } = await apiClient.get<ApiResponse<ApprovalFlow[]>>('/admin/approval-flows')
    return data
  },

  /**
   * Get single approval flow by type
   */
  getByType: async (type: string) => {
    const { data } = await apiClient.get<ApiResponse<ApprovalFlow>>(`/admin/approval-flows/${type}`)
    return data
  },

  /**
   * Update approval flow
   */
  update: async (type: string, payload: UpdateApprovalFlowPayload) => {
    const { data } = await apiClient.put<ApiResponse<ApprovalFlow>>(
      `/admin/approval-flows/${type}`,
      payload
    )
    return data
  },

  /**
   * Get users for select options
   */
  getUsersOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/approval-flows/users-select-options'
    )
    return data
  },

  /**
   * Get roles for select options
   */
  getRolesOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/approval-flows/roles-select-options'
    )
    return data
  },

  /**
   * Get positions for select options
   */
  getPositionsOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/approval-flows/positions-select-options'
    )
    return data
  },
}
