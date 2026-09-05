/**
 * Settings Type Definitions
 * API endpoint: /api/admin/settings
 */

export interface Settings {
  // Existing settings
  project_reminder_days: number
  attendance_radius_meters: number
  shift_reminder_hours: number

  // App Branding
  app_logo: string | null
  app_title: string
  company_name: string
  company_tagline: string
  company_description: string
  login_image: string | null
  favicon: string | null

  // OPS Module Status
  ops_absensi_status: string
  ops_patroli_status: string
  ops_panic_status: string
  ops_enrollment_status: string
}

export interface SettingsApiResponse {
  success: boolean
  data: Settings
}

export interface UpdateSettingsPayload {
  // Existing settings
  project_reminder_days: number
  attendance_radius_meters: number
  shift_reminder_hours: number

  // App Branding (optional - only send if changed)
  app_title?: string
  company_name?: string
  company_tagline?: string
  company_description?: string

  // OPS Module Status
  ops_absensi_status?: string
  ops_patroli_status?: string
  ops_panic_status?: string
  ops_enrollment_status?: string
}

export interface UpdateSettingsPayloadWithFiles extends UpdateSettingsPayload {
  app_logo?: File | null
  login_image?: File | null
  favicon?: File | null
}
