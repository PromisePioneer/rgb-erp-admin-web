/**
 * Documents API Module
 * Endpoints for documents management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Document,
  DocumentsFilters,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from '../types/documents.types'

export const documentsApi = {
  /**
   * Get list of documents with optional filters
   * GET /api/admin/documents
   */
  getList: async (params?: DocumentsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Document[]>>('/admin/documents', {
      params,
    })
    return data
  },

  /**
   * Get single document by ID
   * GET /api/admin/documents/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Document>>(`/admin/documents/${id}`)
    return data
  },

  /**
   * Create new document
   * POST /api/admin/documents
   */
  create: async (payload: CreateDocumentPayload) => {
    const { data } = await apiClient.post<ApiResponse<Document>>('/admin/documents', payload)
    return data
  },

  /**
   * Update existing document
   * PUT /api/admin/documents/:id
   */
  update: async (id: number, payload: UpdateDocumentPayload) => {
    const { data } = await apiClient.put<ApiResponse<Document>>(`/admin/documents/${id}`, payload)
    return data
  },

  /**
   * Delete document (soft delete)
   * DELETE /api/admin/documents/:id
   */
  delete: async (id: number) => {
    await apiClient.delete(`/admin/documents/${id}`)
  },

  /**
   * Bulk delete documents (soft delete)
   * POST /api/admin/documents/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/documents/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get select options for dropdown
   * GET /api/admin/documents/select-options
   */
  getSelectOptions: async (params?: { q?: string; selected?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ id: number; name: string; text: string }[]>>(
      '/admin/documents/select-options',
      { params }
    )
    return data
  },
}
