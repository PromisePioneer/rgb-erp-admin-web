/**
 * Patrol Reports API Module
 * READ-ONLY operations for patrol session reports
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  PatrolSession,
  PatrolSessionDetail,
  PatrolReportsFilters,
  PatrolStats,
  ProjectOption,
} from '../types/patrol-reports.types'

export const patrolReportsApi = {
  /**
   * Get list of patrol sessions with filters
   * GET /api/admin/patrol-reports
   */
  getList: async (params?: PatrolReportsFilters) => {
    const { data } = await apiClient.get<ApiResponse<PatrolSession[]>>('/admin/patrol-reports', {
      params,
    })
    return data
  },

  /**
   * Get patrol session detail with scans
   * GET /api/admin/patrol-reports/:sessionId
   */
  getById: async (sessionId: number) => {
    const { data } = await apiClient.get<ApiResponse<PatrolSessionDetail>>(
      `/admin/patrol-reports/${sessionId}`
    )
    return data
  },

  /**
   * Get stats for the filter period
   * GET /api/admin/patrol-reports/stats
   */
  getStats: async (params?: { month?: string; project_id?: number; employee_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<PatrolStats>>('/admin/patrol-reports/stats', {
      params,
    })
    return data
  },

  /**
   * Get projects that have checkpoints (for filter dropdown)
   * GET /api/admin/patrol-reports/projects
   */
  getProjects: async () => {
    const { data } = await apiClient.get<ApiResponse<ProjectOption[]>>(
      '/admin/patrol-reports/projects'
    )
    return data
  },
}
