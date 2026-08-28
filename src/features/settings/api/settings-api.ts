/**
 * Settings API Module
 * Endpoints for settings management
 */
import { apiClient } from '@/lib/api-client'
import type {
  Settings,
  SettingsApiResponse,
  UpdateSettingsPayload,
} from '../types/settings.types'

export const settingsApi = {
  /**
   * Get current settings
   * GET /api/admin/settings
   */
  get: async (): Promise<Settings> => {
    const { data } = await apiClient.get<SettingsApiResponse>('/admin/settings')
    return data.data
  },

  /**
   * Update settings
   * PUT /api/admin/settings
   */
  update: async (payload: UpdateSettingsPayload): Promise<Settings> => {
    const { data } = await apiClient.put<SettingsApiResponse>('/admin/settings', payload)
    return data.data
  },
}
