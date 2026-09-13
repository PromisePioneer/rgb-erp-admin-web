/**
 * Daily Task Review Criteria Type Definitions
 * API endpoint: /api/admin/daily-task-review-criteria
 */

export interface ReviewCriteria {
  id: number
  name: string
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ReviewCriteriaFilters {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
  per_page?: number
}

export interface ReviewCriteriaPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ReviewCriteriaPagination
  message?: string
}

export interface CreateReviewCriteriaPayload {
  name: string
  order: number
  status: 'active' | 'inactive'
}

export interface UpdateReviewCriteriaPayload extends CreateReviewCriteriaPayload {}
