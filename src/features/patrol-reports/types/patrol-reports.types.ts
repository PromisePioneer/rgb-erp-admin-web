/**
 * Patrol Report Type Definitions
 * API endpoint: /api/admin/patrol-reports
 */

export interface PatrolSession {
  id: number
  employee_id: number
  employee_name: string
  employee_code: string
  project_id: number
  project_name: string
  round_number: string
  round_start_time: string
  total_checkpoints: number
  scanned_count: number
  progress: string
  progress_percent: number
  status: 'completed' | 'in_progress' | 'incomplete' | 'failed'
  status_text: string
  started_at: string
  completed_at: string | null
  completion_time: string | null
  invalid_sequences: number
}

export interface PatrolScan {
  index: number
  checkpoint_id: number
  checkpoint_name: string
  checkpoint_code: string
  sequence_order: string
  scanned_at: string
  photo_url: string | null
  lat: number | null
  lng: number | null
  distance_meters: number | null
  is_valid_sequence: boolean
  is_mock_location: boolean | null
  liveness_passed: boolean | null
  face_match_score: number | null
  device_id: string | null
  warnings: string[]
  distance_warning: string | null
  has_warnings: boolean
}

export interface PatrolCheckpoint {
  id: number
  name: string
  code: string
  sequence_order: number
}

export interface PatrolSessionDetail {
  session: {
    id: number
    employee_name: string
    employee_code: string
    project_name: string
    round_number: string
    round_start_time: string
    status: string
    status_text: string
    started_at: string
    completed_at: string | null
    completion_time: string | null
  }
  stats: {
    total_checkpoints: number
    scanned_count: number
    invalid_sequences: number
    progress_percent: number
  }
  checkpoints: PatrolCheckpoint[]
  scans: PatrolScan[]
}

export interface PatrolStats {
  total_sessions: number
  completed: number
  in_progress: number
  incomplete: number
  failed: number
  avg_completion_time: string
  invalid_sequences: number
}

export interface PatrolReportsFilters {
  month?: string
  project_id?: number
  employee_id?: number
  status?: 'completed' | 'in_progress' | 'incomplete' | 'failed'
  page?: number
  per_page?: number
}

export interface PatrolReportsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PatrolReportsPagination
  message?: string
}

// Select options
export interface ProjectOption {
  id: number
  name: string
}
