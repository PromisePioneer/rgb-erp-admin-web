// @ts-nocheck
import { apiClient } from '@/lib/api-client'

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: any
  message?: string
}

export const fundRequestsApi = {
  getList: async (params?: any) => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/admin/fund-requests', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/admin/fund-requests/${id}`)
    return data
  },

  create: async (payload: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/admin/fund-requests', payload)
    return data
  },

  update: async (id: number, payload: any) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/admin/fund-requests/${id}`, payload)
    return data
  },

  submitForApproval: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/admin/fund-requests/${id}/submit`)
    return data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/fund-requests/${id}`)
  },

  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ deleted: number }>>('/admin/fund-requests/bulk-delete', { ids })
    return data
  },
}
