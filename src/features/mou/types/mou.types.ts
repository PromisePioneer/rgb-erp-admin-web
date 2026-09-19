/**
 * MOU Type Definitions
 * API endpoint: /api/admin/mou
 */

// MOU Header
export interface Mou {
    id: number
    client_id: number
    client_name: string
    first_party_name: string
    first_party_position: string
    first_party_company_address: string
    second_party_name: string
    second_party_position: string
    second_party_company_address: string
    monthly_fee: number | null
    start_date: string | null
    end_date: string | null
    management_fee: number | null
    pph23: number | null
    ppn: number | null
    date: string
    status: number
    created_at: string
    updated_at: string
}

export interface MouDetail extends Mou {
    shifts: MouShift[]
    personnel: MouPersonnel[]
    client: {
        id: number
        name: string
    } | null
}

export interface MouShift {
    id: number
    mou_id: number
    name: string
    start_time: string
    end_time: string
    created_at: string
    updated_at: string
}

export interface MouPersonnel {
    id: number
    mou_id: number
    role_id: number
    quantity: number
    created_at: string
    updated_at: string
    role?: {
        id: number
        name: string
    }
}

export interface MouFilters {
    search?: string
    client_id?: number
    status?: number
    page?: number
    per_page?: number
}

export interface MouPagination {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    meta?: MouPagination
    message?: string
}

// Form Payloads
export interface CreateMouPayload {
    client_id: number
    first_party_name: string
    first_party_position: string
    first_party_company_address: string
    second_party_name: string
    second_party_position: string
    second_party_company_address: string
    monthly_fee?: number | null
    start_date?: string | null
    end_date?: string | null
    management_fee?: number | null
    pph23?: number | null
    ppn?: number | null
    date: string
    // Nested data
    shifts?: CreateMouShiftPayload[]
    personnel?: CreateMouPersonnelPayload[]
}

export interface UpdateMouPayload extends CreateMouPayload {
}

export interface CreateMouShiftPayload {
    name: string
    start_time: string
    end_time: string
}

export interface CreateMouPersonnelPayload {
    role_id: number
    role_name: string
    quantity: number
}

// Wizard form state
export interface MouWizardFormState {
    // Step 1: MOU Header
    client_id: number | null
    first_party_name: string
    first_party_position: string
    first_party_company_address: string
    second_party_name: string
    second_party_position: string
    second_party_company_address: string
    monthly_fee: number | null
    start_date: string
    end_date: string
    management_fee: number | null
    pph23: number | null
    ppn: number | null
    date: string

    // Step 2: MOU Shifts
    shifts: CreateMouShiftPayload[]

    // Step 3: MOU Personnel
    personnel: CreateMouPersonnelPayload[]

    // Step 4: Employees (will be handled separately)
    employees: CreateEmployeeFromWizard[]
}

export interface CreateEmployeeFromWizard {
    temp_id: string // Temporary ID for client-side management
    name: string
    phone?: string
    role_id: number
    role_name: string
    client_id: number
    area_id?: number
    area_name?: string
    base_salary: number
    join_date: string
}

// Employee creation result for tracking success/failure
export interface EmployeeCreationResult {
    temp_id: string
    success: boolean
    employee_id?: number
    employee_code?: string
    error?: string
}

// Select options
export interface ClientOption {
    id: number
    name: string
    text: string
    company_id?: number | null
}

export interface RoleOption {
    id: number
    name: string
    text: string
}
