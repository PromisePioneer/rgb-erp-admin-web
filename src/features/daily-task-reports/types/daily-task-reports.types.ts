/**
 * Daily Task Reports Type Definitions
 * API endpoint: /api/admin/daily-task-reports
 */
import type { NonChemicalCondition, ChemicalCondition } from '@/types/condition'

export type DailyTaskNonChemicalCondition = NonChemicalCondition
export type DailyTaskChemicalCondition = ChemicalCondition

export interface DailyTaskReport {
  id: number
  employee_id: number
  employee_name: string
  employee_code: string
  area_name: string | null
  item_id: number
  item_name: string
  status: 'assigned' | 'in_progress' | 'completed' | 'reviewed'
  status_text: string
  start_at: string | null
  end_at: string | null
  target_minutes: number | null
  target_note: string | null
  average_rating: number | null
  duration_minutes: number | null
  assigned_by_name: string
  assigned_date: string
}

export interface DailyTaskPhoto {
  id: number
  type: 'before' | 'after'
  url: string
  created_at: string
}

export interface DailyTaskReviewScore {
  criteria_id: number
  criteria_name: string
  score: number
}

export interface DailyTaskReview {
  id: number
  reviewer_id: number
  reviewer_name: string
  notes: string | null
  reviewed_at: string
  scores: DailyTaskReviewScore[]
}

// Union type for condition values (handles both non-chemical and chemical)
export type DailyTaskConditionValue = NonChemicalCondition | ChemicalCondition

export interface DailyTaskConditionItem {
  id: number
  name: string
  initial_condition: DailyTaskConditionValue | null
  initial_condition_label: string | null
  final_condition: DailyTaskConditionValue | null
  final_condition_label: string | null
}

export interface DailyTaskReportDetail extends DailyTaskReport {
  tools: DailyTaskConditionItem[]
  chemicals: DailyTaskConditionItem[]
  ppes: DailyTaskConditionItem[]
  photos: DailyTaskPhoto[]
  machines: DailyTaskConditionItem[]
  reviews: DailyTaskReview[]
  duration_minutes: number | null
  notes: string | null
}

export interface DailyTaskStats {
  total_tasks: number
  completed_tasks: number
  reviewed_tasks: number
  in_progress_tasks: number
  assigned_tasks: number
  month_average_rating: number | null
}

export interface ReportFilters {
  month?: string
  area_id?: number
  employee_id?: number
  status?: string
  page?: number
  per_page?: number
}

export interface ReportPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ReportPagination
  message?: string
}

// Select options
export interface AreaOption {
  id: number
  name: string
}

export interface EmployeeOption {
  id: number
  name: string
  code: string
}

// Review criteria (fetched from API)
export interface ReviewCriteria {
  id: number
  name: string
  order: number
}

// Review form payload
export interface SubmitReviewPayload {
  notes?: string
  scores: { criteria_id: number; score: number }[]
}
