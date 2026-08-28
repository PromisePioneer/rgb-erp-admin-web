/**
 * Employee Type Definitions
 * API endpoint: /api/admin/employees
 */

export interface Employee {
  id: number
  company_id: number | null
  company_name: string | null
  position_id: number | null
  position_name: string | null
  province_id: number | null
  province_name: string | null
  code: string
  name: string
  photo: string | null
  phone: string | null
  client_id: number | null
  client_name: string | null
  area_id: number | null
  area_name: string | null
  pos_id: number | null
  pos_name: string | null
  status: number
  created_at: string
  updated_at: string
}

export interface EmployeeDetail extends Employee {
  position_id: number | null
  position_name: string | null
  province_id: number | null
  province_name: string | null
  photo: string | null
  birth_date: string | null
  birth_place: string | null
  address: string | null
  address2: string | null
  religion: string | null
  id_card: string | null
  blood_type: string | null
  height: number | null
  weight: number | null
  marital_status: string | null
  marriage_date: string | null
  divorced_date: string | null
  father_name: string | null
  mother_name: string | null
  parent_address: string | null
  parent_phone: string | null
  father_occupation: string | null
  mother_occupation: string | null
  spouse_name: string | null
  spouse_birth_date: string | null
  spouse_birth_place: string | null
  spouse_education: string | null
  spouse_occupation: string | null
  housing_status: string | null
  base_salary: number | null
  ptkp_status: string | null
  join_date: string | null
  bpjs_health: boolean | null
  bpjs_employment: boolean | null
  drive_license_type: string | null
  drive_license_number: string | null
  client_id: number | null
  client_name: string | null
  children: EmployeeChild[]
  siblings: EmployeeSibling[]
  educations: EmployeeEducation[]
  trainings: EmployeeTraining[]
  languages: EmployeeLanguage[]
  social_activities: EmployeeSocialActivity[]
}

export interface EmployeeChild {
  name: string
  birth_date: string | null
  birth_place: string | null
  education: string | null
}

export interface EmployeeSibling {
  type: string
  name: string
  age: number | null
  education: string | null
  job: string | null
}

export interface EmployeeEducation {
  from: number | null
  to: number | null
  school: string
  city: string | null
  cert: boolean
}

export interface EmployeeTraining {
  course: string
  duration: string | null
  location: string | null
}

export interface EmployeeLanguage {
  name: string
  written: string | null
  spoken: string | null
  notes: string | null
}

export interface EmployeeSocialActivity {
  id?: number
  organization_name: string
  year: string
  position: string
  notes: string
}

export interface EmployeesFilters {
  search?: string
  company_id?: number
  status?: number
  page?: number
  per_page?: number
}

export interface EmployeesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: EmployeesPagination
  message?: string
}

export interface CreateEmployeePayload {
  company_id?: number | null
  position_id?: number | null
  province_id?: number | null
  client_id?: number | null
  area_id?: number | null
  pos_id?: number | null
  code: string
  photo?: File | null
  name: string
  phone?: string | null
  birth_date?: string | null
  birth_place?: string | null
  address?: string | null
  address2?: string | null
  religion?: string | null
  id_card?: string | null
  blood_type?: string | null
  height?: number | null
  weight?: number | null
  marital_status?: string | null
  marriage_date?: string | null
  divorced_date?: string | null
  father_name?: string | null
  mother_name?: string | null
  parent_address?: string | null
  parent_phone?: string | null
  father_occupation?: string | null
  mother_occupation?: string | null
  spouse_name?: string | null
  spouse_birth_date?: string | null
  spouse_birth_place?: string | null
  spouse_education?: string | null
  spouse_occupation?: string | null
  housing_status?: string | null
  base_salary?: number | null
  ptkp_status?: string | null
  join_date?: string | null
  bpjs_health?: boolean | null
  bpjs_employment?: boolean | null
  drive_license_type?: string | null
  drive_license_number?: string | null
  status: number
  // Dynamic arrays
  children_name?: string[]
  children_birth_date?: string[]
  children_birth_place?: string[]
  children_education?: string[]
  sibling_type?: string[]
  sibling_name?: string[]
  sibling_age?: number[]
  sibling_education?: string[]
  sibling_job?: string[]
  education_from?: number[]
  education_to?: number[]
  education_school?: string[]
  education_city?: string[]
  education_certificate?: boolean[]
  training_course?: string[]
  training_duration?: string[]
  training_location?: string[]
  language_name?: string[]
  language_written?: string[]
  language_spoken?: string[]
  language_notes?: string[]
  // Social activity fields
  social_activity_organization?: string[]
  social_activity_year?: string[]
  social_activity_position?: string[]
  social_activity_notes?: string[]
}

export interface UpdateEmployeePayload extends CreateEmployeePayload {}

/**
 * Response from GET /api/admin/employees/generate-code
 * Returns the next available employee code for a given province, company, and year
 *
 * Format: {COMPANY}-86.{PROVINCE_CODE}.{YEAR}.{SEQUENCE}
 * - RGB company uses latin_code (BPS code): "RGB-86.32.23.00001"
 * - RBM company uses romawi_code: "RBM-86.XII.25.00001"
 */
export interface EmployeeCodeResponse {
  success: boolean
  data: {
    province_id: number
    province_name: string
    romawi_code: string
    latin_code: string
    company_code: string
    join_year: number
    next_code: string
  }
}
