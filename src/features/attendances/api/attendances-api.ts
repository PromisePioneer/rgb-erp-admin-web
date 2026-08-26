/**
 * Attendances API Module
 * Endpoints for attendance management (READ-ONLY)
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Attendance,
  AttendanceRecap,
  AttendancesFilters,
  AttendanceStats,
  AttendanceExport,
} from '../types/attendances.types'

interface AttendanceListMeta extends AttendancesFilters {
  stats?: AttendanceStats
  selected_month?: string
}

export const attendancesApi = {
  /**
   * Get list of attendance records with optional filters
   * GET /api/admin/attendance
   */
  getList: async (params?: AttendancesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Attendance[]> & { meta: AttendanceListMeta }>(
      '/admin/attendance',
      { params }
    )
    return data
  },

  /**
   * Get attendance recap (grouped by employee and date)
   * GET /api/admin/attendance/recap
   */
  getRecap: async (params?: AttendancesFilters) => {
    const { data } = await apiClient.get<ApiResponse<AttendanceRecap[]> & { meta: AttendanceListMeta }>(
      '/admin/attendance/recap',
      { params }
    )
    return data
  },

  /**
   * Get employees select options for dropdown
   * GET /api/admin/attendance/employees/select-options
   */
  getEmployeesSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; code: string; text: string }[]>>(
      '/admin/attendance/employees/select-options',
      { params }
    )
    return data
  },

  /**
   * Export attendance recap to JSON
   * GET /api/admin/attendance/export
   */
  export: async (params?: { month?: string; employee_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<AttendanceExport>>(
      '/admin/attendance/export',
      { params }
    )
    return data
  },
}
