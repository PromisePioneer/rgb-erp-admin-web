/**
 * MOU API Module
 * Endpoints for MOU management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Mou,
  MouDetail,
  MouFilters,
  CreateMouPayload,
  UpdateMouPayload,
  ClientOption,
  RoleOption,
} from '../types/mou.types'

export const mouApi = {
  /**
   * Get list of MOUs with optional filters
   * GET /api/admin/mou
   */
  getList: async (params?: MouFilters) => {
    const { data } = await apiClient.get<ApiResponse<Mou[]>>('/admin/mou', {
      params,
    })
    return data
  },

  /**
   * Get single MOU by ID with all nested data
   * GET /api/admin/mou/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<MouDetail>>(`/admin/mou/${id}`)
    return data
  },

  /**
   * Get MOU by client ID
   * GET /api/admin/mou/by-client/:clientId
   */
  getByClientId: async (clientId: number) => {
    const { data } = await apiClient.get<ApiResponse<MouDetail>>(`/admin/mou/by-client/${clientId}`)
    return data
  },

  /**
   * Create new MOU with shifts and personnel
   * POST /api/admin/mou
   */
  create: async (payload: CreateMouPayload) => {
    const { data } = await apiClient.post<ApiResponse<Mou>>('/admin/mou', payload)
    return data
  },

  /**
   * Update existing MOU
   * PUT /api/admin/mou/:id
   */
  update: async (id: number, payload: UpdateMouPayload) => {
    const { data } = await apiClient.put<ApiResponse<Mou>>(`/admin/mou/${id}`, payload)
    return data
  },

  /**
   * Delete MOU (soft delete)
   * DELETE /api/admin/mou/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/mou/${id}`)
  },

  /**
   * Get client select options for dropdown
   * GET /api/admin/mou/clients/select-options
   */
  getClientsSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<ClientOption[]>>(
      '/admin/mou/clients/select-options',
      { params }
    )
    return data
  },

  /**
   * Get role select options for dropdown
   * GET /api/admin/mou/roles/select-options
   * Requires company_id to filter roles by company
   */
  getRolesSelectOptions: async (params?: { q?: string; selected?: number; company_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<RoleOption[]>>(
      '/admin/mou/roles/select-options',
      { params }
    )
    return data
  },

  /**
   * Get shifts by client for reference
   * GET /api/admin/mou/clients/:clientId/shifts
   */
  getClientShifts: async (clientId: number) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; start_time: string; end_time: string }[]>>(
      `/admin/mou/clients/${clientId}/shifts`
    )
    return data
  },

  /**
   * Get personnel progress for a specific MOU
   * GET /api/admin/mou/:mouId/personnel-progress
   * Returns breakdown per personnel row with assigned/remaining counts
   */
  getPersonnelProgress: async (mouId: number) => {
    const { data } = await apiClient.get<ApiResponse<{
      mou_personnel_id: number
      role_id: number
      role_name: string
      quantity_needed: number
      assigned: number
      remaining: number
    }[]>>(`/admin/mou/${mouId}/personnel-progress`)
    return data
  },

  /**
   * Get salary suggestion based on salary components
   * GET /api/admin/mou/salary-suggestion?client_id=&role_id=
   * Returns total earning - deductions as suggested real salary
   */
  getSalarySuggestion: async (clientId: number, roleId?: number) => {
    const params: Record<string, number> = { client_id: clientId }
    if (roleId) {
      params.role_id = roleId
    }
    const { data } = await apiClient.get<ApiResponse<{
      client_id: number
      role_id: number | null
      earnings: number
      deductions: number
      net_salary: number
      breakdown: {
        earnings: { name: string; value: number }[]
        deductions: { name: string; value: number }[]
      }
    }>>('/admin/mou/salary-suggestion', { params })
    return data
  },

  /**
   * Get UMK reference for province and year
   * GET /api/admin/mou/umk-reference?province=&year=
   * Falls back to latest year if requested year not available
   */
  getUmkReference: async (province: string, year?: number) => {
    const params: Record<string, string | number> = { province }
    if (year) {
      params.year = year
    }
    const { data } = await apiClient.get<ApiResponse<{
      province: string
      city: string
      value: number
      formatted_value: string
      year_used: number
      year_requested: number
      is_fallback_year: boolean
      fallback_message: string | null
    }>>('/admin/mou/umk-reference', { params })
    return data
  },
}
