/**
 * Settings API Module
 * Endpoints for settings management
 */
import axios from 'axios'
import { apiClient } from '@/lib/api-client'
import type {
  Settings,
  SettingsApiResponse,
  UpdateSettingsPayloadWithFiles,
} from '../types/settings.types'

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  return null
}

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
  update: async (payload: UpdateSettingsPayloadWithFiles): Promise<Settings> => {
    // Separate form data for file uploads
    const hasFiles = payload.app_logo || payload.login_image || payload.favicon

    if (hasFiles) {
      const formData = new FormData()

      // Add all non-file fields
      const { app_logo, login_image, favicon, ...rest } = payload
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      }

      // Add files
      if (app_logo) formData.append('app_logo', app_logo)
      if (login_image) formData.append('login_image', login_image)
      if (favicon) formData.append('favicon', favicon)

      // Use direct axios call for FormData
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const csrfToken = getCsrfToken()

      const response = await axios.post(`${baseURL}/api/admin/settings`, formData, {
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        withCredentials: true,
      })

      return response.data.data as Settings
    }

    // No files - use regular JSON
    const { data } = await apiClient.put<SettingsApiResponse>('/admin/settings', payload)
    return data.data
  },
}
