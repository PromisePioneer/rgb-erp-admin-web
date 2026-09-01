/**
 * Schedules API Module
 * Endpoints for schedules management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Schedule,
  SchedulesFilters,
  SelectOption,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  EmployeeScheduleRow,
} from '../types/schedules.types'
import { downloadBlob, fileToFormData } from '@/utils/download-blob'

export const schedulesApi = {
  /**
   * Get list of schedules with optional filters
   * GET /api/admin/schedules
   */
  getList: async (params?: SchedulesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Schedule[]>>('/admin/schedules', {
      params,
    })
    return data
  },

  /**
   * Get single schedule by ID
   * GET /api/admin/schedules/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Schedule>>(`/admin/schedules/${id}`)
    return data
  },

  /**
   * Create new schedule
   * POST /api/schedules
   */
  create: async (payload: CreateSchedulePayload) => {
    const { data } = await apiClient.post<ApiResponse<Schedule>>('/admin/schedules', payload)
    return data
  },

  /**
   * Update existing schedule
   * PUT /api/admin/schedules/:id
   */
  update: async (id: number, payload: UpdateSchedulePayload) => {
    const { data } = await apiClient.put<ApiResponse<Schedule>>(`/admin/schedules/${id}`, payload)
    return data
  },

  /**
   * Delete schedule
   * DELETE /api/admin/schedules/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/schedules/${id}`)
  },

  /**
   * Bulk delete schedules
   * POST /api/admin/schedules/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/schedules/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get employees select options
   * GET /api/admin/schedules/employees/select-options
   */
  getEmployeesSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/employees/select-options',
      { params }
    )
    return data
  },

  /**
   * Get areas select options (filtered by employee's client)
   * GET /api/admin/schedules/areas/select-options
   */
  getAreasSelectOptions: async (params?: { employee_id?: number; q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/areas/select-options',
      { params }
    )
    return data
  },

  /**
   * Get poss select options (filtered by area)
   * GET /api/admin/schedules/poss/select-options
   */
  getPossSelectOptions: async (params: { area_id: number; q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/poss/select-options',
      { params }
    )
    return data
  },

  /**
   * Get shifts select options
   * GET /api/admin/schedules/shifts/select-options
   */
  getShiftsSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/schedules/shifts/select-options',
      { params }
    )
    return data
  },

  /**
   * Get employees grouped by client and area for calendar view
   * Includes all employees with placements
   * GET /api/admin/schedules/employees-by-placement
   */
  getEmployeesByPlacement: async (params?: { month?: string; search?: string }) => {
    const { data } = await apiClient.get<ApiResponse<{
      employees: EmployeeScheduleRow[]
      dates: string[]
    }>>('/admin/schedules/employees-by-placement', { params })
    return data
  },

  /**
   * Download schedule template Excel file
   * GET /api/admin/schedules/template
   */
  downloadTemplate: async (params: {
    year: number
    month: number
    client_id?: number
    area_id?: number
  }) => {
    const response = await apiClient.get('/admin/schedules/template', {
      params,
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const filename = `jadwal_template_${params.year}_${String(params.month).padStart(2, '0')}.xlsx`
    downloadBlob(blob, filename)
    return { success: true, filename }
  },

  /**
   * Import schedules from Excel file
   * POST /api/admin/schedules/import
   */
  importSchedules: async (
    file: File,
    year: number,
    month: number,
    area_id?: number
  ): Promise<ApiResponse<{ message: string }>> => {
    const formData = fileToFormData(file)
    formData.append('year', String(year))
    formData.append('month', String(month))
    if (area_id) {
      formData.append('area_id', String(area_id))
    }

    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/schedules/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data
  },

  /**
   * Export schedules to Excel file
   * GET /api/admin/schedules/export
   */
  exportSchedules: async (params: { year: number; month: number }) => {
    const response = await apiClient.get('/admin/schedules/export', {
      params,
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const filename = `jadwal_${params.year}_${String(params.month).padStart(2, '0')}.xlsx`
    downloadBlob(blob, filename)
    return { success: true, filename }
  },
}
