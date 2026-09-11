/**
 * Reports API Module
 * Endpoints for field reports management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  FieldReport,
  ReportByArea,
  ReportsFilters,
  Client,
} from '../types/reports.types'

export const reportsApi = {
  /**
   * Get list of field reports with optional filters
   * GET /api/admin/reports
   */
  getList: async (params?: ReportsFilters) => {
    const { data } = await apiClient.get<ApiResponse<FieldReport[]>>(
      '/admin/reports',
      { params }
    )
    return data
  },

  /**
   * Get reports grouped by area
   * GET /api/admin/reports/by-area
   */
  getByArea: async (params?: ReportsFilters) => {
    const { data } = await apiClient.get<ApiResponse<ReportByArea[]>>(
      '/admin/reports/by-area',
      { params }
    )
    return data
  },

  /**
   * Get clients list for filter dropdown
   * GET /api/admin/clients
   * Note: This endpoint will be created later, using mock for now
   */
  getClients: async () => {
    // TODO: Replace with actual endpoint when /api/admin/clients is created
    // For now, return mock data structure
    const { data } = await apiClient.get<ApiResponse<Client[]>>(
      '/admin/clients'
    )
    return data
  },

  /**
   * Get single report by ID
   * GET /api/admin/reports/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<FieldReport>>(
      `/admin/reports/${id}`
    )
    return data
  },

  /**
   * Bulk delete field reports
   * POST /api/admin/reports/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<void>>('/admin/reports/bulk-delete', { ids })
    return data
  },
}
