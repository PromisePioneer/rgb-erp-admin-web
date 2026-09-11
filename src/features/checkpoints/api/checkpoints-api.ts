/**
 * Checkpoints API Module
 * Endpoints for checkpoints management
 */
import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  Checkpoint,
  CheckpointDetail,
  CheckpointsFilters,
  CreateCheckpointPayload,
  UpdateCheckpointPayload,
  AreaOption,
} from '../types/checkpoints.types'

export const checkpointsApi = {
  /**
   * Get list of checkpoints with optional filters
   * GET /api/admin/checkpoints
   */
  getList: async (params?: CheckpointsFilters) => {
    const { data } = await apiClient.get<ApiResponse<Checkpoint[]>>('/admin/checkpoints', {
      params,
    })
    return data
  },

  /**
   * Get single checkpoint by ID
   * GET /api/admin/checkpoints/:id
   */
  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<CheckpointDetail>>(`/admin/checkpoints/${id}`)
    return data
  },

  /**
   * Create new checkpoint
   * POST /api/admin/checkpoints
   */
  create: async (payload: CreateCheckpointPayload) => {
    const { data } = await apiClient.post<ApiResponse<Checkpoint>>('/admin/checkpoints', payload)
    return data
  },

  /**
   * Update existing checkpoint
   * PUT /api/admin/checkpoints/:id
   */
  update: async (id: number, payload: UpdateCheckpointPayload) => {
    const { data } = await apiClient.put<ApiResponse<Checkpoint>>(`/admin/checkpoints/${id}`, payload)
    return data
  },

  /**
   * Delete checkpoint (soft delete if has scans)
   * DELETE /api/admin/checkpoints/:id
   */
  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/checkpoints/${id}`)
    return data
  },

  /**
   * Bulk delete checkpoints
   * POST /api/admin/checkpoints/bulk-delete
   */
  bulkDelete: async (ids: number[]) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string; deleted: number; deactivated: number }>>(
      '/admin/checkpoints/bulk-delete',
      { ids }
    )
    return data
  },

  /**
   * Get areas for select options
   * GET /api/admin/checkpoints/areas-select-options
   */
  getAreasOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<AreaOption[]>>(
      '/admin/checkpoints/areas-select-options'
    )
    return data
  },

  /**
   * Get next sequence numbers for an area
   * GET /api/admin/checkpoints/next-sequence
   */
  getNextSequence: async (areaId: number) => {
    const { data } = await apiClient.get<ApiResponse<{ sequence: number }>>(
      '/admin/checkpoints/next-sequence',
      { params: { area_id: areaId } }
    )
    return data
  },

  /**
   * Regenerate secret key for a checkpoint
   * POST /api/admin/checkpoints/:id/regenerate-secret
   */
  regenerateSecret: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<{ secret_key: string; message: string }>>(
      `/admin/checkpoints/${id}/regenerate-secret`
    )
    return data
  },
}
