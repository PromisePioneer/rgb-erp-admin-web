/**
 * Tangible Asset Classes API
 */
import { apiClient } from '@/lib/api-client'
import type { TangibleAssetClass, TangibleAssetClassFormData } from '../types/tangible-asset-class.types'

export const tangibleAssetClassApi = {
  getList: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<{ data: TangibleAssetClass[] }>('/admin/tangible-asset-class', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<{ data: TangibleAssetClass }>(`/admin/tangible-asset-class/${id}`)
    return data
  },

  create: async (payload: TangibleAssetClassFormData) => {
    const { data } = await apiClient.post<{ data: TangibleAssetClass }>('/admin/tangible-asset-class', payload)
    return data
  },

  update: async (id: number, payload: Partial<TangibleAssetClassFormData>) => {
    const { data } = await apiClient.put<{ data: TangibleAssetClass }>(`/admin/tangible-asset-class/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/tangible-asset-class/${id}`)
  },

  bulkDelete: async (ids: number[]) => {
    await apiClient.post('/admin/tangible-asset-class/bulk-delete', { ids })
  },
}
