/**
 * Face Enrollments API Module
 * Endpoints for face enrollments management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  FaceEnrollment,
  FaceEnrollmentFilters,
} from '../types/face-enrollments.types'

export const faceEnrollmentsApi = {
  /**
   * Get list of face enrollments with optional filters
   * GET /api/admin/face-enrollments
   */
  getList: async (params?: FaceEnrollmentFilters) => {
    const { data } = await apiClient.get<ApiResponse<FaceEnrollment[]>>('/admin/face-enrollments', {
      params,
    })
    return data
  },

  /**
   * Get single face enrollment by ID with photos
   * GET /api/admin/face-enrollments/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<FaceEnrollment>>(`/admin/face-enrollments/${id}`)
    return data
  },

  /**
   * Delete face enrollment (soft delete)
   * DELETE /api/admin/face-enrollments/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/face-enrollments/${id}`)
  },

  /**
   * Get employees for filter dropdown
   * GET /api/admin/face-enrollments/employees
   */
  getEmployees: async (params?: { q?: string }) => {
    const { data } = await apiClient.get<ApiResponse<Array<{ id: number; name: string; code: string | null }>>>(
      '/admin/face-enrollments/employees',
      { params }
    )
    return data
  },

  /**
   * Get photo URL for face enrollment
   */
  getPhotoUrl: (enrollmentId: number, photoId?: number) => {
    let url = `/admin/face-enrollments/${enrollmentId}/photo`
    if (photoId) {
      url += `?photo=${photoId}`
    }
    return url
  },
}
