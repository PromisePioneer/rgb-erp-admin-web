/**
 * Panic Alerts API
 * READ-ONLY operations
 */
import { apiClient } from '@/lib/api-client'
import type {
  PanicAlert,
  PanicAlertDetail,
  PanicAlertsFilters,
  ApiResponse,
} from '../types/panic-alerts.types'

export const panicAlertsApi = {
  /**
   * Get paginated list of panic alerts
   */
  getList: async (params?: PanicAlertsFilters) => {
    const { data } = await apiClient.get<ApiResponse<PanicAlert[]>>('/admin/panic-alerts', { params })
    return data
  },

  /**
   * Get single panic alert by ID
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<PanicAlertDetail>>(`/admin/panic-alerts/${id}`)
    return data
  },
}
