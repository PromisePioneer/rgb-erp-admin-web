/**
 * Approvals API
 */
import { apiClient } from '@/lib/api-client'
import type {
  Approval,
  ApprovalDetail,
  ApprovalsFilters,
  ApprovalActPayload,
  ApiResponse,
} from '../types/approvals.types'

export const approvalsApi = {
  /**
   * Get pending approvals for current user
   */
  getList: async (params?: ApprovalsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Approval[]>>('/admin/approvals', { params })
    return data
  },

  /**
   * Get single approval by ID
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ApprovalDetail>>(`/admin/approvals/${id}`)
    return data
  },

  /**
   * Act on an approval (approve/reject)
   */
  act: async (id: number, payload: ApprovalActPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; id: number; decision: string }>>(
      `/admin/approvals/${id}/act`,
      payload
    )
    return data
  },
}
