/**
 * Daily Task Reports API Module
 * READ-ONLY operations for daily task reports + review submission
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  DailyTaskReportDetail,
  DailyTaskStats,
  ReportFilters,
  AreaOption,
  EmployeeOption,
  ReviewCriteria,
  SubmitReviewPayload,
} from '../types/daily-task-reports.types'

const BASE_URL = '/admin/daily-task-reports'

export const dailyTaskReportsApi = {
  /**
   * Get list of daily task reports with filters
   * GET /api/admin/daily-task-reports
   */
  getList: async (params?: ReportFilters) => {
    const response = await apiClient.get<any>(BASE_URL, { params })
    const data = response.data
    // For paginated results, flatten the response
    const responseData = data?.data?.data ?? data?.data ?? []
    const responseMeta = data?.data?.meta ?? data?.meta ?? undefined
    return {
      success: data?.success ?? true,
      data: responseData,
      meta: responseMeta,
    }
  },

  /**
   * Get report detail with photos, tools, chemicals, ppes, reviews
   * GET /api/admin/daily-task-reports/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<DailyTaskReportDetail>>(`${BASE_URL}/${id}`)
    return data
  },

  /**
   * Get stats for the filter period
   * GET /api/admin/daily-task-reports/stats
   */
  getStats: async (params?: { month?: string; area_id?: number; employee_id?: number }) => {
    const { data } = await apiClient.get<ApiResponse<DailyTaskStats>>(`${BASE_URL}/stats`, {
      params,
    })
    return data
  },

  /**
   * Submit review for a completed task
   * POST /api/admin/daily-task-reports/:id/review
   */
  submitReview: async (id: number, payload: SubmitReviewPayload) => {
    const { data } = await apiClient.post<ApiResponse<DailyTaskReportDetail>>(
      `${BASE_URL}/${id}/review`,
      payload
    )
    return data
  },

  /**
   * Get review criteria (for dynamic star rating form)
   * GET /api/admin/daily-task-reports/criteria
   */
  getCriteria: async () => {
    const { data } = await apiClient.get<ApiResponse<ReviewCriteria[]>>(`${BASE_URL}/criteria`)
    return data
  },

  /**
   * Get areas for filter dropdown
   * GET /api/admin/daily-task-reports/areas
   */
  getAreas: async () => {
    const { data } = await apiClient.get<ApiResponse<AreaOption[]>>(`${BASE_URL}/areas`)
    return data
  },

  /**
   * Get employees for filter dropdown
   * GET /api/admin/daily-task-reports/employees
   */
  getEmployees: async () => {
    const { data } = await apiClient.get<ApiResponse<EmployeeOption[]>>(`${BASE_URL}/employees`)
    return data
  },
}
