/**
 * Face Enrollment Type Definitions
 * API endpoint: /api/admin/face-enrollments
 */

export interface FaceEnrollmentPhoto {
  id: number
  face_enrollment_id: number
  photo_path: string | null
  quality: number
  confidence: number
  face_detected: boolean
  face_count: number
  captured_at: string
}

export interface FaceEnrollment {
  id: number
  employee_id: number
  provider: string | null
  facegallery_id: string | null
  enrolled_at: string
  embedding: unknown | null
  embedding_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  employee?: {
    id: number
    name: string
    code: string | null
  }
  photos?: FaceEnrollmentPhoto[]
  photo_count?: number
}

export interface FaceEnrollmentFilters {
  employee_id?: number
  search?: string
  page?: number
  per_page?: number
}

export interface FaceEnrollmentPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: FaceEnrollmentPagination
  message?: string
}
