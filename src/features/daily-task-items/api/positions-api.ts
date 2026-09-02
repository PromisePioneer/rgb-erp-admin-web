/**
 * Positions API
 */
import { apiClient } from '@/lib/api-client'

export interface PositionOption {
  id: number
  name: string
  text: string
}

export interface Position {
  id: number
  name: string
  status: number
}

export const positionsApi = {
  /**
   * Get select options for dropdown
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }): Promise<{ success: boolean; data: PositionOption[] }> => {
    const { data } = await apiClient.get('/admin/positions/select-options', { params })
    return data
  },
}
