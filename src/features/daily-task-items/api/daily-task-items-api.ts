/**
 * Daily Task Items API
 */
import { apiClient } from '@/lib/api-client'
import { fileToFormData } from '@/utils/download-blob'
import type {
  ApiResponse,
  DailyTaskItem,
  DailyTaskItemDetail,
  DailyTaskItemsFilters,
  CreateDailyTaskItem,
  UpdateDailyTaskItem,
  SelectOption,
} from '../types/daily-task-items.types'

export interface ImportStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  percent: number
  message: string
  imported: number
  skipped: number
  errors: number
  error_messages: string[]
  updated_at: string
}

export const dailyTaskItemsApi = {
  /**
   * Get paginated list of daily task items
   */
  getList: async (params?: DailyTaskItemsFilters): Promise<ApiResponse<DailyTaskItem[]>> => {
    const { data } = await apiClient.get<ApiResponse<DailyTaskItem[]>>('/admin/daily-task-items', {
      params,
    })
    return data
  },

  /**
   * Get single daily task item by ID
   */
  getById: async (id: number): Promise<ApiResponse<DailyTaskItemDetail>> => {
    const { data } = await apiClient.get<ApiResponse<DailyTaskItemDetail>>(
      `/admin/daily-task-items/${id}`
    )
    return data
  },

  /**
   * Get select options for dropdown
   */
  getSelectOptions: async (): Promise<ApiResponse<SelectOption[]>> => {
    const { data } = await apiClient.get<ApiResponse<SelectOption[]>>(
      '/admin/daily-task-items/select-options'
    )
    return data
  },

  /**
   * Create new daily task item
   */
  create: async (payload: CreateDailyTaskItem): Promise<ApiResponse<DailyTaskItem>> => {
    const { data } = await apiClient.post<ApiResponse<DailyTaskItem>>(
      '/admin/daily-task-items',
      payload
    )
    return data
  },

  /**
   * Update existing daily task item
   */
  update: async (id: number, payload: UpdateDailyTaskItem): Promise<ApiResponse<DailyTaskItem>> => {
    const { data } = await apiClient.put<ApiResponse<DailyTaskItem>>(
      `/admin/daily-task-items/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete daily task item (soft delete)
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/daily-task-items/${id}`)
    return data
  },

  /**
   * Bulk delete daily task items
   */
  bulkDelete: async (ids: number[]): Promise<ApiResponse<{ deleted_count: number }>> => {
    const { data } = await apiClient.post<ApiResponse<{ deleted_count: number }>>(
      '/admin/daily-task-items/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Download import template
   * GET /api/admin/daily-task-items/template
   */
  getTemplateUrl: (): string => {
    return '/api/admin/daily-task-items/template'
  },

  /**
   * Import daily task items from Excel file (queued)
   * POST /api/admin/daily-task-items/import
   */
  importItems: async (file: File): Promise<ApiResponse<{ job_id: string; message: string }>> => {
    const formData = fileToFormData(file)

    const { data } = await apiClient.post<ApiResponse<{ job_id: string; message: string }>>(
      '/admin/daily-task-items/import',
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
   * Get import job status
   * GET /api/admin/daily-task-items/import/status/{jobId}
   */
  getImportStatus: async (jobId: string): Promise<ApiResponse<ImportStatus>> => {
    const { data } = await apiClient.get<ApiResponse<ImportStatus>>(
      `/admin/daily-task-items/import/status/${jobId}`
    )
    return data
  },

  /**
   * Clear import job status
   * DELETE /api/admin/daily-task-items/import/status/{jobId}
   */
  clearImportStatus: async (jobId: string): Promise<ApiResponse<{ message: string }>> => {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/daily-task-items/import/status/${jobId}`
    )
    return data
  },
}
