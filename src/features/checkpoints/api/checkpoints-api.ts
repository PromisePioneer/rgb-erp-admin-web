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
  ProjectOption,
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
   * Get projects for select options
   * GET /api/admin/checkpoints/projects-select-options
   */
  getProjectsOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<ProjectOption[]>>(
      '/admin/checkpoints/projects-select-options'
    )
    return data
  },

  /**
   * Get next sequence number for a project
   * GET /api/admin/checkpoints/next-sequence
   */
  getNextSequence: async (projectId: number) => {
    const { data } = await apiClient.get<ApiResponse<{ sequence: number }>>(
      '/admin/checkpoints/next-sequence',
      { params: { project_id: projectId } }
    )
    return data
  },
}
