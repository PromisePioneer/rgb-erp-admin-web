import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  DistributionRequest,
  DistributionRequestFull,
  DistributionRequestsFilters,
  CreateDistributionRequestPayload,
  UpdateDistributionRequestPayload,
  MarkDeliveredPayload,
  AreaOption,
  WarehouseOption,
  ClientOption,
  DistributionRequestOption,
} from '../types/distribution-requests.types'

export const distributionRequestsApi = {
  getList: async (params?: DistributionRequestsFilters) => {
    const { data } = await apiClient.get<ApiResponse<DistributionRequest[]>>('/admin/distribution-requests', {
      params,
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DistributionRequestFull>>(
      `/admin/distribution-requests/${id}`
    )
    return data
  },

  create: async (payload: CreateDistributionRequestPayload) => {
    const { data } = await apiClient.post<ApiResponse<DistributionRequest>>(
      '/admin/distribution-requests',
      payload
    )
    return data
  },

  update: async (id: number, payload: UpdateDistributionRequestPayload) => {
    const { data } = await apiClient.put<ApiResponse<DistributionRequest>>(
      `/admin/distribution-requests/${id}`,
      payload
    )
    return data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/distribution-requests/${id}`)
  },

  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/distribution-requests/bulk-delete',
      { ids }
    )
    return data
  },

  submitForApproval: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      `/admin/distribution-requests/${id}/submit`
    )
    return data
  },

  markAsDelivered: async (id: number, payload: MarkDeliveredPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      `/admin/distribution-requests/${id}/deliver`,
      payload
    )
    return data
  },

  // Select options
  getAreasOptions: async (params?: { q?: string; client_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<AreaOption[]>>(
      '/admin/distribution-requests/areas-select-options',
      { params }
    )
    return data
  },

  getWarehousesOptions: async (params?: { q?: string; exclude_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<WarehouseOption[]>>(
      '/admin/distribution-requests/warehouses-select-options',
      { params }
    )
    return data
  },

  getClientsOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<ClientOption[]>>(
      '/admin/distribution-requests/clients-select-options',
      { params }
    )
    return data
  },

  getSelectOptions: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<DistributionRequestOption[]>>(
      '/admin/distribution-requests/select-options',
      { params }
    )
    return data
  },
}
