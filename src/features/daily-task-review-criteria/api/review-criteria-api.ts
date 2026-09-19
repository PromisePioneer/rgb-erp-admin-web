/**
 * Daily Task Review Criteria API Module
 * Endpoints for review criteria management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  ReviewCriteria,
  ReviewCriteriaFilters,
  CreateReviewCriteriaPayload,
  UpdateReviewCriteriaPayload,
} from '../types/review-criteria.types'

export const reviewCriteriaApi = {
  /**
   * Get list of review criteria with optional filters
   * GET /api/admin/daily-task-review-criteria
   */
  getList: async (params?: ReviewCriteriaFilters) => {
    const { data } = await apiClient.get<ApiResponse<ReviewCriteria[]>>(
      '/admin/daily-task-review-criteria',
      { params }
    )
    return data
  },

  /**
   * Get single review criteria by ID
   * GET /api/admin/daily-task-review-criteria/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<ReviewCriteria>>(
      `/admin/daily-task-review-criteria/${id}`
    )
    return data
  },

  /**
   * Create new review criteria
   * POST /api/admin/daily-task-review-criteria
   */
  create: async (payload: CreateReviewCriteriaPayload) => {
    const { data } = await apiClient.post<ApiResponse<ReviewCriteria>>(
      '/admin/daily-task-review-criteria',
      payload
    )
    return data
  },

  /**
   * Update existing review criteria
   * PUT /api/admin/daily-task-review-criteria/:id
   */
  update: async (id: number, payload: UpdateReviewCriteriaPayload) => {
    const { data } = await apiClient.put<ApiResponse<ReviewCriteria>>(
      `/admin/daily-task-review-criteria/${id}`,
      payload
    )
    return data
  },

  /**
   * Delete review criteria
   * DELETE /api/admin/daily-task-review-criteria/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/daily-task-review-criteria/${id}`)
  },

  /**
   * Bulk delete review criteria
   * POST /api/admin/daily-task-review-criteria/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/admin/daily-task-review-criteria/bulk-delete',
      { ids }
    )
    return data
  },
}
