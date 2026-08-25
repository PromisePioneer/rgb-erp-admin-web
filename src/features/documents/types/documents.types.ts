/**
 * Document Type Definitions
 * API endpoint: /api/admin/documents
 */

export interface Document {
  id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface DocumentsFilters {
  search?: string
  status?: number
  page?: number
  per_page?: number
}

export interface DocumentsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: DocumentsPagination
  message?: string
}

export interface CreateDocumentPayload {
  name: string
  status: number
}

export interface UpdateDocumentPayload extends CreateDocumentPayload {}
