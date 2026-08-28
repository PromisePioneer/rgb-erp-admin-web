/**
 * Position Privileges API
 */
import { apiClient } from '@/lib/api-client'
import type {
  PositionPrivilegesResponse,
  UpdatePrivilegesPayload,
} from '../types/position-privileges.types'

export const positionPrivilegesApi = {
  /**
   * Get privileges for a position
   * GET /api/admin/positions/{id}/privileges
   */
  getPrivileges: async (positionId: number): Promise<PositionPrivilegesResponse> => {
    const response = await apiClient.get<{ success: boolean; data: PositionPrivilegesResponse }>(
      `/admin/positions/${positionId}/privileges`
    )
    return response.data.data
  },

  /**
   * Update privileges for a position
   * POST /api/admin/positions/{id}/privileges
   */
  updatePrivileges: async (
    positionId: number,
    payload: UpdatePrivilegesPayload
  ): Promise<void> => {
    await apiClient.post(`/admin/positions/${positionId}/privileges`, payload)
  },
}
