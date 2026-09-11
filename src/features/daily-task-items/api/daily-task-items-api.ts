/**
 * Daily Task Items API
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  DailyTaskItem,
  DailyTaskItemDetail,
  DailyTaskItemsFilters,
  CreateDailyTaskItem,
  UpdateDailyTaskItem,
  SelectOption,
} from '../types/daily-task-items.types'

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
}
