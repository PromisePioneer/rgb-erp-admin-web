/**
 * Provinces API Module
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Province,
  ProvincesFilters,
  CreateProvincePayload,
  UpdateProvincePayload,
} from '../types/provinces.types'

export const provincesApi = {
  getList: async (params?: ProvincesFilters) => {
    const { data } = await apiClient.get<ApiResponse<Province[]>>('/admin/provinces', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Province>>(`/admin/provinces/${id}`)
    return data
  },

  create: async (payload: CreateProvincePayload) => {
    const { data } = await apiClient.post<ApiResponse<Province>>('/admin/provinces', payload)
    return data
  },

  update: async (id: number, payload: UpdateProvincePayload) => {
    const { data } = await apiClient.put<ApiResponse<Province>>(`/admin/provinces/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/provinces/${id}`)
  },

  getSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>('/admin/provinces/select-options', { params })
    return data
  },
}
