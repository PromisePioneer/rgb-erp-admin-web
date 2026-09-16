/**
 * UMK API Module
 * Upah Minimum Kota / Regional Minimum Wage
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  UMK,
  UMKFilters,
  CreateUMKPayload,
  UpdateUMKPayload,
} from '../types/umk.types'

export const umkApi = {
  getList: async (params?: UMKFilters) => {
    const { data } = await apiClient.get<ApiResponse<UMK[]>>('/admin/umk', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<UMK>>(`/admin/umk/${id}`)
    return data
  },

  create: async (payload: CreateUMKPayload) => {
    const { data } = await apiClient.post<ApiResponse<UMK>>('/admin/umk', payload)
    return data
  },

  update: async (id: number, payload: UpdateUMKPayload) => {
    const { data } = await apiClient.put<ApiResponse<UMK>>(`/admin/umk/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/umk/${id}`)
  },

  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; deleted_count: number }>>('/admin/umk/bulk-delete', { ids })
    return data
  },

  getYears: async () => {
    const { data } = await apiClient.get<ApiResponse<number[]>>('/admin/umk/years')
    return data
  },

  getProvinces: async () => {
    const { data } = await apiClient.get<ApiResponse<string[]>>('/admin/umk/provinces')
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/umk/select-options
   */
  getSelectOptions: async (params?: { q?: string; year?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{
      id: number
      year: number
      province: string
      city: string
      value: number
      formatted_value: string
      text: string
    }[]>>('/admin/umk/select-options', { params })
    return data
  },
}
