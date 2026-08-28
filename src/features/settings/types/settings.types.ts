/**
 * Settings Type Definitions
 * API endpoint: /api/admin/settings
 */

export interface Settings {
  project_reminder_days: number
  attendance_radius_meters: number
  shift_reminder_hours: number
}

export interface SettingsApiResponse {
  success: boolean
  data: Settings
}

export interface UpdateSettingsPayload {
  project_reminder_days: number
  attendance_radius_meters: number
  shift_reminder_hours: number
}
