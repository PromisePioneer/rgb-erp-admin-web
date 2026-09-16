/**
 * MOU Wizard Modal
 * Multi-step form for creating MOU with shifts, personnel, and employees
 */
import React, {useState, useEffect, useCallback, useMemo} from 'react'
import {FileText, Clock, Users, UserPlus, Plus, Trash2, ChevronLeft, ChevronRight, Check} from 'lucide-react'
import Dialog from '@/components/ui/dialog'
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import {apiClient} from '@/lib/api-client'
import {useCompanyStore} from '@/stores/company-store'

// Currency Input Component for Indonesian Rupiah
interface CurrencyInputProps {
    value: string | number | null
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    disabled?: boolean
    className?: string
}

function CurrencyInput({
                           value,
                           onChange,
                           placeholder = '0',
                           error,
                           disabled = false,
                           className = '',
                       }: CurrencyInputProps) {
    // Format number to Indonesian Rupiah
    const formatToRupiah = (num: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num)
    }

    // Parse formatted string back to number
    const parseRupiah = (str: string): string => {
        // Remove all non-numeric characters
        return str.replace(/[^\d]/g, '')
    }

    // Display value (formatted) vs actual value
    const displayValue = useMemo(() => {
        if (!value || value === '') return ''
        const num = typeof value === 'string' ? parseFloat(parseRupiah(value)) : value
        if (isNaN(num)) return ''
        return formatToRupiah(num)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = parseRupiah(e.target.value)
        if (rawValue === '') {
            onChange('')
        } else {
            onChange(rawValue)
        }
    }

    return (
        <div className={className}>
            <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          Rp
        </span>
                <Input
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        'pl-8 text-right font-mono',
                        error && 'border-destructive'
                    )}
                />
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
    )
}

import {Label} from '@/components/ui/label'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {clientsApi} from '@/features/clients/api/clients-api'
import {areasApi} from '@/features/areas/api/areas-api'
import {umkApi} from '@/features/umk/api/umk-api'
import {mouApi} from '@/features/mou/api/mou-api'
import {employeesApi} from '@/features/employees/api/employees-api'
import type {
    CreateMouShiftPayload,
    CreateMouPersonnelPayload,
    ClientOption,
    RoleOption,
    CreateEmployeeFromWizard,
    EmployeeCreationResult,
} from '@/features/mou'
import {
    validateShift,
    validatePersonnel,
    validateStep1,
    validateStep2,
    validateStep3,
} from '../validations/mou-validation'

interface MouWizardModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clientId?: number
    clientName?: string
    onSuccess?: () => void
}

type WizardStep = 1 | 2 | 3 | 4

const STEPS = [
    {number: 1 as WizardStep, label: 'MOU Header', icon: FileText},
    {number: 2 as WizardStep, label: 'Shift', icon: Clock},
    {number: 3 as WizardStep, label: 'Personnel', icon: Users},
    {number: 4 as WizardStep, label: 'Employees', icon: UserPlus},
]

// Validation errors type
type ValidationErrors = Record<string, string | undefined>

export function MouWizardModal({open, onOpenChange, clientId, clientName, onSuccess}: MouWizardModalProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: MOU Header
        client_id: null as number | null,
        first_party_name: '',
        first_party_position: '',
        first_party_company_address: '',
        second_party_name: '',
        second_party_position: '',
        second_party_company_address: '',
        monthly_fee: '' as string | number,
        start_date: '',
        end_date: '',
        management_fee: '10',
        pph23: '2',
        ppn: '11',
        date: new Date().toISOString().split('T')[0],

        // Step 2: Shifts
        shifts: [] as CreateMouShiftPayload[],

        // Step 3: Personnel
        personnel: [] as CreateMouPersonnelPayload[],

        // Step 4: Employees
        employees: [] as CreateEmployeeFromWizard[],
    })

    // New employee form state
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        phone: '',
        role_id: 0 as number,
        role_name: '',
        area_id: undefined as number | undefined,
        area_name: '',
        base_salary: '' as string,
        join_date: new Date().toISOString().split('T')[0],
    })

    // Areas for selected client
    const [clientAreas, setClientAreas] = useState<{id: number; name: string}[]>([])

    // Employee creation progress tracking
    const [employeeCreationResults, setEmployeeCreationResults] = useState<EmployeeCreationResult[]>([])

    // New shift form state
    const [newShift, setNewShift] = useState<CreateMouShiftPayload>({
        name: '',
        start_time: '',
        end_time: '',
    })

    // New personnel form state
    const [newPersonnel, setNewPersonnel] = useState<CreateMouPersonnelPayload>({
        role_id: 0,
        role_name: '',
        quantity: 1,
    })

    // Real-time validation errors
    const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({})

    // Selected client info for filtering roles
    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)

    // Store roles for lookup (to get role_name)
    const [rolesList, setRolesList] = useState<RoleOption[]>([])

    // Fetch clients for async select
    const fetchClients = useCallback(async (search?: string) => {
        try {
            const response = await clientsApi.getSelectOptions({q: search})
            return response.data
        } catch (error) {
            console.error('fetchClients error:', error)
            return []
        }
    }, [])

    // Fetch roles filtered by client's company_id (using MouController endpoint)
    // Falls back to current company's roles if no client selected yet
    const fetchRoles = useCallback(async (search?: string, companyId?: number | null) => {
        // Fallback to current company's roles if no client selected
        const effectiveCompanyId = companyId ?? useCompanyStore.getState().currentCompany?.id
        try {
            const params: Record<string, string | number | undefined> = { q: search }
            if (effectiveCompanyId) {
                params.company_id = effectiveCompanyId
            }
            // Use MouController's rolesSelectOptions endpoint
            const response = await apiClient.get<{ success: boolean; data: RoleOption[] }>(
                '/admin/mou/roles/select-options',
                { params }
            )
            // Store roles for lookup (to get role_name)
            setRolesList(response.data.data)
            return response.data.data
        } catch (error) {
            console.error('fetchRoles error:', error)
            return []
        }
    }, [])

    // Validate single field on change
    const validateField = useCallback((field: string, value: unknown) => {
        // Create a copy of formData with the new value
        const testData = {...formData, [field]: value}
        const result = validateStep1(testData)
        if (!result.success) {
            const errors: ValidationErrors = {}
            result.error.errors.forEach((err) => {
                const path = err.path[0] as string
                errors[path] = err.message
            })
            setFieldErrors((prev) => ({...prev, [field]: errors[field]}))
        } else {
            setFieldErrors((prev) => {
                const {[field]: _, ...rest} = prev
                return rest
            })
        }
    }, [formData])

    // Initial load
    useEffect(() => {
        if (open) {
            setCurrentStep(1)
            setError(null)
            setFieldErrors({})

            // Find the selected client if clientId is provided
            if (clientId) {
                // Fetch client details to get company_id
                clientsApi.getById(clientId).then((response) => {
                    if (response.data) {
                        setSelectedClient({
                            id: response.data.id,
                            name: response.data.name,
                            text: response.data.name,
                            company_id: (response.data as any).company_id,
                        })
                    }
                }).catch(console.error)
            } else {
                setSelectedClient(null)
            }

            // Reset form with client if provided
            setFormData({
                client_id: clientId ?? null,
                first_party_name: '',
                first_party_position: '',
                first_party_company_address: '',
                second_party_name: '',
                second_party_position: '',
                second_party_company_address: '',
                monthly_fee: '',
                start_date: '',
                end_date: '',
                management_fee: '10',
                pph23: '2',
                ppn: '11',
                date: new Date().toISOString().split('T')[0],
                shifts: [],
                personnel: [],
                employees: [],
            })
        }
    }, [open, clientId])

    // Update field with validation (realtime for all fields)
    const updateField = (field: string, value: unknown) => {
        setFormData((prev) => ({...prev, [field]: value}))
        // Real-time validation for all step 1 fields
        validateField(field, value)
    }

    // Add shift with validation
    const addShift = () => {
        const result = validateShift(newShift)
        if (!result.success) {
            setError(result.error.errors[0]?.message || 'Data shift tidak valid')
            return
        }
        setFormData((prev) => ({
            ...prev,
            shifts: [...prev.shifts, {...newShift}],
        }))
        setNewShift({name: '', start_time: '', end_time: ''})
        setError(null)
    }

    // Remove shift
    const removeShift = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            shifts: prev.shifts.filter((_, i) => i !== index),
        }))
    }

    // Add personnel with validation
    const addPersonnel = () => {
        const result = validatePersonnel(newPersonnel)
        if (!result.success) {
            setError(result.error.errors[0]?.message || 'Data personnel tidak valid')
            return
        }
        setFormData((prev) => ({
            ...prev,
            personnel: [...prev.personnel, {...newPersonnel}],
        }))
        setNewPersonnel({role_id: 0, role_name: '', quantity: 1})
        setError(null)
    }

    // Remove personnel
    const removePersonnel = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            personnel: prev.personnel.filter((_, i) => i !== index),
        }))
    }

    // Add employee to the list
    const addEmployee = () => {
        if (!newEmployee.name.trim()) {
            setError('Nama employee harus diisi')
            return
        }
        if (!newEmployee.role_id) {
            setError('Role harus dipilih')
            return
        }
        if (!formData.client_id) {
            setError('Client harus dipilih')
            return
        }
        if (!newEmployee.base_salary) {
            setError('Gaji riil harus diisi')
            return
        }

        const employee: CreateEmployeeFromWizard = {
            temp_id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: newEmployee.name.trim(),
            phone: newEmployee.phone || undefined,
            role_id: newEmployee.role_id,
            role_name: newEmployee.role_name,
            client_id: formData.client_id,
            area_id: newEmployee.area_id,
            area_name: newEmployee.area_name,
            base_salary: parseInt(newEmployee.base_salary) || 0,
            join_date: newEmployee.join_date,
        }

        setFormData((prev) => ({
            ...prev,
            employees: [...prev.employees, employee],
        }))

        // Reset new employee form
        setNewEmployee({
            name: '',
            phone: '',
            role_id: 0,
            role_name: '',
            area_id: undefined,
            area_name: '',
            base_salary: '',
            join_date: formData.start_date || new Date().toISOString().split('T')[0],
        })
        setError(null)
    }

    // Remove employee from the list
    const removeEmployee = (tempId: string) => {
        setFormData((prev) => ({
            ...prev,
            employees: prev.employees.filter((e) => e.temp_id !== tempId),
        }))
    }

    // Validate step with schema
    const validateStep = (step: WizardStep): boolean => {
        switch (step) {
            case 1: {
                const result = validateStep1(formData)
                console.log('validateStep1 result:', result)
                if (!result.success) {
                    const errors: ValidationErrors = {}
                    result.error.errors.forEach((err) => {
                        const path = err.path[0] as string
                        errors[path] = err.message
                        console.log('Error for', path, ':', err.message)
                    })
                    setFieldErrors(errors)
                    setError('Mohon lengkapi semua field yang diperlukan')
                    return false
                }
                setFieldErrors({})
                return true
            }
            case 2: {
                const result = validateStep2(formData)
                if (!result.success) {
                    setError('Minimal harus ada 1 shift')
                    return false
                }
                setError(null)
                return formData.shifts.length > 0
            }
            case 3: {
                const result = validateStep3(formData)
                if (!result.success) {
                    setError('Minimal harus ada 1 personnel')
                    return false
                }
                setError(null)
                return formData.personnel.length > 0
            }
            case 4:
                return true // Step 4 is placeholder for now
            default:
                return true
        }
    }

    // Next step
    const nextStep = () => {
        if (!validateStep(currentStep)) {
            // Show summary of errors
            const errorList = Object.values(fieldErrors).filter(Boolean)
            if (errorList.length > 0) {
                setError(`Error: ${errorList.slice(0, 3).join(', ')}${errorList.length > 3 ? '...' : ''}`)
            } else {
                setError('Mohon lengkapi semua field yang diperlukan')
            }
            return
        }
        setError(null)
        setFieldErrors({})
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as WizardStep)
        }
    }

    // Previous step
    const prevStep = () => {
        setError(null)
        setFieldErrors({})
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as WizardStep)
        }
    }

    // Submit
    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)
        setEmployeeCreationResults([])

        try {
            // 1. Create MOU first
            const mouPayload = {
                client_id: formData.client_id!,
                first_party_name: formData.first_party_name,
                first_party_position: formData.first_party_position,
                first_party_company_address: formData.first_party_company_address,
                second_party_name: formData.second_party_name,
                second_party_position: formData.second_party_position,
                second_party_company_address: formData.second_party_company_address,
                monthly_fee: formData.monthly_fee ? Number(formData.monthly_fee) : null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                management_fee: formData.management_fee ? Number(formData.management_fee) : null,
                pph23: formData.pph23 ? Number(formData.pph23) : null,
                ppn: formData.ppn ? Number(formData.ppn) : null,
                date: formData.date,
                shifts: formData.shifts,
                personnel: formData.personnel,
            }

            console.log('Creating MOU with payload:', mouPayload)
            const mouResponse = await mouApi.create(mouPayload)

            if (!mouResponse.success) {
                throw new Error('Gagal membuat MOU')
            }

            const mouId = mouResponse.data.id
            console.log('MOU created successfully with ID:', mouId)

            // 2. Create employees one by one
            const results: EmployeeCreationResult[] = []
            for (const emp of formData.employees) {
                try {
                    // Get current company from store
                    const currentCompany = useCompanyStore.getState().currentCompany

                    // Create employee payload
                    // Note: The backend auto-generates code based on province
                    // For MOU wizard, we pass minimal required fields
                    const employeePayload = {
                        company_id: currentCompany?.id,
                        name: emp.name,
                        phone: emp.phone || null,
                        role_id: emp.role_id,
                        client_id: emp.client_id,
                        area_id: emp.area_id || null,
                        base_salary: emp.base_salary,
                        join_date: emp.join_date,
                        status: 1,
                        // These are required by EmployeeRequest but will be auto-generated
                        // We pass empty values for now as placeholders
                        province_id: 1, // TODO: Get from client address
                        code: '', // Will be auto-generated by backend
                    }

                    const empResponse = await employeesApi.create(employeePayload as any)

                    results.push({
                        temp_id: emp.temp_id,
                        success: true,
                        employee_id: empResponse.data?.id,
                        employee_code: empResponse.data?.code,
                    })

                    console.log('Employee created:', emp.name, empResponse.data?.code)
                } catch (empError) {
                    const errorMessage = empError instanceof Error ? empError.message : 'Unknown error'
                    results.push({
                        temp_id: emp.temp_id,
                        success: false,
                        error: errorMessage,
                    })
                    console.error('Failed to create employee:', emp.name, empError)
                }
            }

            setEmployeeCreationResults(results)

            // 3. Check results
            const failedCount = results.filter(r => !r.success).length
            const successCount = results.filter(r => r.success).length

            if (failedCount > 0) {
                // Partial failure - show results but don't close modal
                const failedEmployees = results
                    .filter(r => !r.success)
                    .map(r => {
                        const emp = formData.employees.find(e => e.temp_id === r.temp_id)
                        return `${emp?.name}: ${r.error}`
                    })
                    .join('; ')

                setError(
                    `MOU berhasil dibuat (ID: ${mouId}). ` +
                    `${successCount} employee berhasil, ${failedCount} gagal: ${failedEmployees}. ` +
                    `Silakan retry employee yang gagal atau tutup wizard.`
                )
                // Don't close modal - let user retry
                return
            }

            // All successful
            console.log('All employees created successfully')
            onOpenChange(false)
            onSuccess?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle client selection - fetch full client details to get company_id
    const handleClientChange = (client: ClientOption | null) => {
        if (client) {
            // Fetch client details to get company_id for role filtering
            clientsApi.getById(client.id).then((response) => {
                if (response.data) {
                    setSelectedClient({
                        ...client,
                        company_id: (response.data as any).company_id,
                    })

                    // Fetch areas for this client
                    areasApi.getSelectOptions({ client_id: client.id }).then((areaResponse) => {
                        if (areaResponse.success) {
                            setClientAreas(areaResponse.data.map((a: { id: number; name: string }) => ({
                                id: a.id,
                                name: a.name,
                            })))
                        }
                    }).catch(console.error)
                }
            }).catch(console.error)
            setFormData(prev => ({...prev, client_id: client.id}))
        } else {
            setSelectedClient(null)
            setClientAreas([])
            setFormData(prev => ({...prev, client_id: null}))
        }
    }

    // Check if client is readOnly (when clientId is provided from parent)
    const isClientReadOnly = !!clientId

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                           style={{width: '1200px', maxWidth: '120vw', height: '100vh'}}>
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5"/>
                        Buat MOU Baru
                        {clientName && <span className="text-muted-foreground font-normal">- {clientName}</span>}
                    </DialogTitle>
                </DialogHeader>

                {/* Stepper */}
                <div className="relative px-4 py-3 bg-muted/50 rounded-lg overflow-hidden">
                    {/* Background progress line */}
                    <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-border -translate-y-1/2"/>

                    {/* Animated progress line */}
                    <div
                        className="absolute top-1/2 left-8 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500 ease-out"
                        style={{
                            width: currentStep === 1 ? '0%' :
                                   currentStep === 2 ? 'calc(33.33% - 8px)' :
                                   currentStep === 3 ? 'calc(66.66% - 8px)' :
                                   'calc(100% - 8px)'
                        }}
                    />

                    <div className="relative flex items-center justify-between">
                        {STEPS.map((step) => {
                            const isActive = currentStep === step.number
                            const isCompleted = currentStep > step.number
                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className="flex flex-col items-center gap-1">
                                        {/* Circle */}
                                        <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110'
                                                    : isCompleted
                                                        ? 'bg-green-500 text-white scale-105'
                                                        : 'bg-background border-2 border-border text-muted-foreground'
                                            }`}
                                        >
                                            {isCompleted ? <Check className="h-4 w-4 animate-in fade-in zoom-in duration-200"/> : step.number}
                                        </div>
                                        {/* Label */}
                                        <span
                                            className={`text-xs whitespace-nowrap transition-all duration-200 ${
                                                isActive ? 'font-semibold text-primary' :
                                                isCompleted ? 'text-green-600' : 'text-muted-foreground'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm rounded-md">
                        {error}
                    </div>
                )}

                {/* Step content */}
                <div className="flex-1 overflow-y-auto px-1">
                    {currentStep === 1 && (
                        <Step1Header
                            formData={formData}
                            updateField={updateField}
                            fieldErrors={fieldErrors}
                            selectedClient={selectedClient}
                            onClientChange={handleClientChange}
                            isClientReadOnly={isClientReadOnly}
                            fetchClients={fetchClients}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2Shifts
                            formData={formData}
                            newShift={newShift}
                            setNewShift={setNewShift}
                            addShift={addShift}
                            removeShift={removeShift}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Personnel
                            formData={formData}
                            newPersonnel={newPersonnel}
                            setNewPersonnel={setNewPersonnel}
                            addPersonnel={addPersonnel}
                            removePersonnel={removePersonnel}
                            fetchRoles={fetchRoles}
                            companyId={selectedClient?.company_id}
                            rolesList={rolesList}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4Employees
                            formData={formData}
                            newEmployee={newEmployee}
                            setNewEmployee={setNewEmployee}
                            addEmployee={addEmployee}
                            removeEmployee={removeEmployee}
                            clientAreas={clientAreas}
                            rolesList={rolesList}
                            fetchRoles={fetchRoles}
                            companyId={selectedClient?.company_id}
                            employeeCreationResults={employeeCreationResults}
                        />
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="pt-4 border-t">
                    <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1"/>
                            Sebelumnya
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            {currentStep < 4 ? (
                                <Button onClick={nextStep}>
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4 ml-1"/>
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan MOU'}
                                    <Check className="h-4 w-4 ml-1"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Step 1: MOU Header
interface Step1HeaderProps {
    formData: {
        client_id: number | null
        first_party_name: string
        first_party_position: string
        first_party_company_address: string
        second_party_name: string
        second_party_position: string
        second_party_company_address: string
        monthly_fee: string | number
        start_date: string
        end_date: string
        management_fee: string
        pph23: string
        ppn: string
        date: string
    }
    updateField: (field: string, value: unknown) => void
    fieldErrors: ValidationErrors
    selectedClient: ClientOption | null
    onClientChange: (client: ClientOption | null) => void
    isClientReadOnly: boolean
    fetchClients: (search?: string) => Promise<ClientOption[]>
}

function Step1Header({
                         formData,
                         updateField,
                         fieldErrors,
                         selectedClient,
                         onClientChange,
                         isClientReadOnly,
                         fetchClients,
                     }: Step1HeaderProps) {
    // Convert ClientOption to SelectOption format
    const clientLoadOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        const clients = await fetchClients(search)
        return clients.map((c) => ({
            value: c.id,
            label: c.name,
        }))
    }, [fetchClients])

    return (
        <div className="space-y-6 py-4">
            {/* Client Selection with AsyncSelect */}
            <div className="space-y-2">
                <Label htmlFor="client_id">Client *</Label>
                <AsyncSelect
                    value={selectedClient?.id ?? null}
                    onChange={(value) => {
                        // console.log('AsyncSelect onChange called, value:', value)
                        if (value === null) {
                            onClientChange(null)
                            return
                        }
                        // Find the client from the loaded options
                        const clientId = Number(value)
                        const clientOption = {
                            id: clientId,
                            name: `Client ${clientId}`, // Will be updated when loaded
                            text: `Client ${clientId}`,
                        }
                        onClientChange(clientOption)
                    }}
                    loadOptions={clientLoadOptions}
                    placeholder="Pilih Client"
                    readOnly={isClientReadOnly}
                    error={fieldErrors.client_id}
                    defaultOptions
                />
                {fieldErrors.client_id && (
                    <p className="text-sm text-destructive">{fieldErrors.client_id}</p>
                )}
            </div>

            {/* First Party */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_party_name">Nama Pihak Pertama *</Label>
                    <Input
                        id="first_party_name"
                        value={formData.first_party_name}
                        onChange={(e) => updateField('first_party_name', e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className={fieldErrors.first_party_name ? 'border-destructive' : ''}
                    />
                    {fieldErrors.first_party_name && (
                        <p className="text-sm text-destructive">{fieldErrors.first_party_name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="first_party_position">Jabatan</Label>
                    <Input
                        id="first_party_position"
                        value={formData.first_party_position}
                        onChange={(e) => updateField('first_party_position', e.target.value)}
                        placeholder="Jabatan"
                        className={fieldErrors.first_party_position ? 'border-destructive' : ''}
                    />
                    {fieldErrors.first_party_position && (
                        <p className="text-sm text-destructive">{fieldErrors.first_party_position}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="first_party_company_address">Alamat Perusahaan Pihak Pertama</Label>
                <Input
                    id="first_party_company_address"
                    value={formData.first_party_company_address}
                    onChange={(e) => updateField('first_party_company_address', e.target.value)}
                    placeholder="Alamat lengkap"
                    className={fieldErrors.first_party_company_address ? 'border-destructive' : ''}
                />
                {fieldErrors.first_party_company_address && (
                    <p className="text-sm text-destructive">{fieldErrors.first_party_company_address}</p>
                )}
            </div>

            {/* Second Party */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="second_party_name">Nama Pihak Kedua *</Label>
                    <Input
                        id="second_party_name"
                        value={formData.second_party_name}
                        onChange={(e) => updateField('second_party_name', e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className={fieldErrors.second_party_name ? 'border-destructive' : ''}
                    />
                    {fieldErrors.second_party_name && (
                        <p className="text-sm text-destructive">{fieldErrors.second_party_name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="second_party_position">Jabatan</Label>
                    <Input
                        id="second_party_position"
                        value={formData.second_party_position}
                        onChange={(e) => updateField('second_party_position', e.target.value)}
                        placeholder="Jabatan"
                        className={fieldErrors.second_party_position ? 'border-destructive' : ''}
                    />
                    {fieldErrors.second_party_position && (
                        <p className="text-sm text-destructive">{fieldErrors.second_party_position}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="second_party_company_address">Alamat Perusahaan Pihak Kedua</Label>
                <Input
                    id="second_party_company_address"
                    value={formData.second_party_company_address}
                    onChange={(e) => updateField('second_party_company_address', e.target.value)}
                    placeholder="Alamat lengkap"
                    className={fieldErrors.second_party_company_address ? 'border-destructive' : ''}
                />
                {fieldErrors.second_party_company_address && (
                    <p className="text-sm text-destructive">{fieldErrors.second_party_company_address}</p>
                )}
            </div>

            {/* Period & Fees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Tanggal MOU *</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateField('date', e.target.value)}
                        className={fieldErrors.date ? 'border-destructive' : ''}
                    />
                    {fieldErrors.date && (
                        <p className="text-sm text-destructive">{fieldErrors.date}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateField('start_date', e.target.value)}
                        className={fieldErrors.start_date ? 'border-destructive' : ''}
                    />
                    {fieldErrors.start_date && (
                        <p className="text-sm text-destructive">{fieldErrors.start_date}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateField('end_date', e.target.value)}
                        className={fieldErrors.end_date ? 'border-destructive' : ''}
                    />
                    {fieldErrors.end_date && (
                        <p className="text-sm text-destructive">{fieldErrors.end_date}</p>
                    )}
                </div>
            </div>

            {/* Fee Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Fee Bulanan (Rp)</Label>
                    <CurrencyInput
                        value={formData.monthly_fee}
                        onChange={(value) => updateField('monthly_fee', value)}
                        error={fieldErrors.monthly_fee}
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="management_fee">Management Fee (%)</Label>
                    <Input
                        id="management_fee"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.management_fee}
                        onChange={(e) => updateField('management_fee', e.target.value)}
                        placeholder="10"
                        className={fieldErrors.management_fee ? 'border-destructive' : ''}
                    />
                    {fieldErrors.management_fee && (
                        <p className="text-sm text-destructive">{fieldErrors.management_fee}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ppn">PPN (%)</Label>
                    <Input
                        id="ppn"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.ppn}
                        onChange={(e) => updateField('ppn', e.target.value)}
                        placeholder="11"
                        className={fieldErrors.ppn ? 'border-destructive' : ''}
                    />
                    {fieldErrors.ppn && (
                        <p className="text-sm text-destructive">{fieldErrors.ppn}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pph23">PPH 23 (%)</Label>
                    <Input
                        id="pph23"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.pph23}
                        onChange={(e) => updateField('pph23', e.target.value)}
                        placeholder="2"
                        className={fieldErrors.pph23 ? 'border-destructive' : ''}
                    />
                    {fieldErrors.pph23 && (
                        <p className="text-sm text-destructive">{fieldErrors.pph23}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Step 2: Shifts
interface Step2ShiftsProps {
    formData: { shifts: CreateMouShiftPayload[] }
    newShift: CreateMouShiftPayload
    setNewShift: (shift: CreateMouShiftPayload) => void
    addShift: () => void
    removeShift: (index: number) => void
}

function Step2Shifts({
                         formData,
                         newShift,
                         setNewShift,
                         addShift,
                         removeShift,
                     }: Step2ShiftsProps) {
    // Shift form validation state
    const [shiftErrors, setShiftErrors] = useState<{ name?: string; start_time?: string; end_time?: string }>({})

    // Validate shift on change
    const handleShiftChange = (field: 'name' | 'start_time' | 'end_time', value: string) => {
        const updatedShift = {...newShift, [field]: value}
        setNewShift(updatedShift)

        // Quick validation
        const errors: { name?: string; start_time?: string; end_time?: string } = {}
        if (field === 'name' && !value) {
            errors.name = 'Nama shift harus diisi'
        }
        if (field === 'start_time' && !value) {
            errors.start_time = 'Jam masuk harus diisi'
        }
        if (field === 'end_time') {
            if (!value) {
                errors.end_time = 'Jam pulang harus diisi'
            } else if (newShift.start_time && value <= newShift.start_time) {
                errors.end_time = 'Jam pulang harus setelah jam masuk'
            }
        }
        setShiftErrors(errors)
    }

    const isShiftValid = newShift.name && newShift.start_time && newShift.end_time && Object.keys(shiftErrors).length === 0

    return (
        <div className="space-y-6 py-4">
            <div>
                <h3 className="text-sm font-medium mb-4">Tambahkan Shift Kerja untuk MOU ini</h3>

                {/* Add shift form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="shift_name">Nama Shift *</Label>
                        <Input
                            id="shift_name"
                            value={newShift.name}
                            onChange={(e) => handleShiftChange('name', e.target.value)}
                            placeholder="Pagi"
                            className={shiftErrors.name ? 'border-destructive' : ''}
                        />
                        {shiftErrors.name && (
                            <p className="text-sm text-destructive">{shiftErrors.name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="start_time">Jam Masuk *</Label>
                        <Input
                            id="start_time"
                            type="time"
                            value={newShift.start_time}
                            onChange={(e) => handleShiftChange('start_time', e.target.value)}
                            className={shiftErrors.start_time ? 'border-destructive' : ''}
                        />
                        {shiftErrors.start_time && (
                            <p className="text-sm text-destructive">{shiftErrors.start_time}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_time">Jam Pulang *</Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={newShift.end_time}
                            onChange={(e) => handleShiftChange('end_time', e.target.value)}
                            className={shiftErrors.end_time ? 'border-destructive' : ''}
                        />
                        {shiftErrors.end_time && (
                            <p className="text-sm text-destructive">{shiftErrors.end_time}</p>
                        )}
                    </div>
                    <div className="flex items-end">
                        <Button onClick={addShift} disabled={!isShiftValid}>
                            <Plus className="h-4 w-4 mr-1"/>
                            Tambah
                        </Button>
                    </div>
                </div>
            </div>

            {/* Shift list */}
            {formData.shifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>Belum ada shift ditambahkan</p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Nama Shift</th>
                            <th className="px-4 py-2 text-left font-medium">Jam Masuk</th>
                            <th className="px-4 py-2 text-left font-medium">Jam Pulang</th>
                            <th className="px-4 py-2 text-right font-medium w-20">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.shifts.map((shift, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2">{shift.name}</td>
                                <td className="px-4 py-2">{shift.start_time}</td>
                                <td className="px-4 py-2">{shift.end_time}</td>
                                <td className="px-4 py-2 text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removeShift(index)}
                                            className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                * Shift yang ditambahkan akan otomatis tersimpan ke tabel Shift dengan client_id terkait saat MOU
                di-submit.
            </p>
        </div>
    )
}

// Step 3: Personnel
interface Step3PersonnelProps {
    formData: { personnel: CreateMouPersonnelPayload[] }
    newPersonnel: CreateMouPersonnelPayload
    setNewPersonnel: (personnel: CreateMouPersonnelPayload) => void
    addPersonnel: () => void
    removePersonnel: (index: number) => void
    fetchRoles: (search?: string, companyId?: number | null) => Promise<RoleOption[]>
    companyId?: number | null
    rolesList: RoleOption[]
}

function Step3Personnel({
                            formData,
                            newPersonnel,
                            setNewPersonnel,
                            addPersonnel,
                            removePersonnel,
                            fetchRoles,
                            companyId,
                            rolesList,
                        }: Step3PersonnelProps) {
    const [roleError, setRoleError] = useState<string | null>(null)

    // Convert RoleOption to SelectOption format
    const roleLoadOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        const roles = await fetchRoles(search, companyId)
        return roles.map((r) => ({
            value: r.id,
            label: r.name,
        }))
    }, [fetchRoles, companyId])

    const handleAddPersonnel = () => {
        if (!newPersonnel.role_id) {
            setRoleError('Role harus dipilih')
            return
        }
        if (newPersonnel.quantity < 1) {
            setRoleError('Jumlah minimal 1')
            return
        }
        setRoleError(null)
        addPersonnel()
    }


    const isPersonnelValid = newPersonnel.role_id > 0 && newPersonnel.quantity >= 1

    return (
        <div className="space-y-6 py-4">
            <div>
                <h3 className="text-sm font-medium mb-4">
                    Tambahkan Personnel (Role & Jumlah) untuk MOU ini
                    {companyId && (
                        <span className="text-xs text-muted-foreground ml-2">
              (Roles difilter berdasarkan company)
            </span>
                    )}
                </h3>

                {/* Add personnel form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="role_id">Role / Jabatan *</Label>
                        <AsyncSelect
                            value={newPersonnel.role_id || null}
                            onChange={(value) => {
                                if (value === null) {
                                    setNewPersonnel({...newPersonnel, role_id: 0, role_name: ''})
                                    setRoleError(null)
                                } else {
                                    // Find role name from rolesList
                                    const roleId = Number(value)
                                    const role = rolesList.find(r => r.id === roleId)
                                    const roleName = role?.name || String(value)
                                    setNewPersonnel({...newPersonnel, role_id: roleId, role_name: roleName})
                                    setRoleError(null)
                                }
                            }}
                            loadOptions={roleLoadOptions}
                            placeholder="Pilih Role"
                            error={roleError || undefined}
                            defaultOptions
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Jumlah *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={newPersonnel.quantity}
                                onChange={(e) => setNewPersonnel({...newPersonnel, quantity: Number(e.target.value)})}
                                className="w-24"
                            />
                            <Button onClick={handleAddPersonnel} disabled={!isPersonnelValid}>
                                <Plus className="h-4 w-4 mr-1"/>
                                Tambah
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personnel list */}
            {formData.personnel.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>Belum ada personnel ditambahkan</p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Role / Jabatan</th>
                            <th className="px-4 py-2 text-center font-medium w-32">Jumlah</th>
                            <th className="px-4 py-2 text-right font-medium w-20">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.personnel.map((person, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2">{person.role_name || `Role #${person.role_id}`}</td>
                                <td className="px-4 py-2 text-center">{person.quantity} orang</td>
                                <td className="px-4 py-2 text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removePersonnel(index)}
                                            className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {formData.personnel.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Ringkasan Personnel</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {formData.personnel.map((person, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{person.role_name || `Role #${person.role_id}`}</span>
                                <span className="font-medium">× {person.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200 flex justify-between font-medium">
                        <span>Total Personnel:</span>
                        <span>{formData.personnel.reduce((sum, p) => sum + p.quantity, 0)} orang</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// Step 4: Employees
interface Step4EmployeesProps {
    formData: {
        personnel: CreateMouPersonnelPayload[]
        employees: CreateEmployeeFromWizard[]
        client_id: number | null
        start_date: string
    }
    newEmployee: {
        name: string
        phone: string
        role_id: number
        role_name: string
        area_id: number | undefined
        area_name: string
        base_salary: string
        join_date: string
    }
    setNewEmployee: React.Dispatch<React.SetStateAction<{
        name: string
        phone: string
        role_id: number
        role_name: string
        area_id: number | undefined
        area_name: string
        base_salary: string
        join_date: string
    }>>
    addEmployee: () => void
    removeEmployee: (tempId: string) => void
    clientAreas: { id: number; name: string }[]
    rolesList: RoleOption[]
    fetchRoles: (search?: string, companyId?: number | null) => Promise<RoleOption[]>
    companyId?: number | null
    employeeCreationResults: EmployeeCreationResult[]
}

function Step4Employees({
    formData,
    newEmployee,
    setNewEmployee,
    addEmployee,
    removeEmployee,
    clientAreas,
    rolesList,
    fetchRoles,
    companyId,
    employeeCreationResults,
}: Step4EmployeesProps) {
    // Calculate progress per role
    const personnelWithProgress = formData.personnel.map(person => {
        const assigned = formData.employees.filter(
            e => e.role_id === person.role_id
        ).length
        return {
            ...person,
            assigned,
            remaining: person.quantity - assigned,
        }
    })

    const totalNeeded = formData.personnel.reduce((sum, p) => sum + p.quantity, 0)
    const totalAssigned = formData.employees.length
    const totalRemaining = totalNeeded - totalAssigned

    // Convert RoleOption to SelectOption format
    const roleLoadOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        const roles = await fetchRoles(search, companyId)
        return roles.map((r) => ({
            value: r.id,
            label: r.name,
        }))
    }, [fetchRoles, companyId])

    // Employee form validity
    const isEmployeeValid = newEmployee.name.trim() &&
        newEmployee.role_id > 0 &&
        formData.client_id &&
        newEmployee.base_salary

    // Get result status for an employee
    const getEmployeeResult = (tempId: string) => {
        return employeeCreationResults.find(r => r.temp_id === tempId)
    }

    return (
        <div className="space-y-6 py-4">
            {/* Personnel Progress Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Progress Personnel</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-background rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{totalNeeded}</div>
                        <div className="text-xs text-muted-foreground">Total Dibutuhkan</div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{totalAssigned}</div>
                        <div className="text-xs text-muted-foreground">Sudah Ditambahkan</div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                        <div className="text-2xl font-bold text-orange-600">{totalRemaining}</div>
                        <div className="text-xs text-muted-foreground">Sisa Slot</div>
                    </div>
                </div>

                {/* Per-role progress */}
                <div className="mt-4 space-y-2">
                    {personnelWithProgress.map((person, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            <div className="w-32 truncate">{person.role_name || `Role #${person.role_id}`}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{
                                                width: `${Math.min(100, (person.assigned / person.quantity) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-20 text-right">
                                        {person.assigned}/{person.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Employee Form */}
            {formData.client_id && (
                <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                        <Plus className="h-4 w-4"/>
                        Tambah Employee
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Nama */}
                        <div className="space-y-2">
                            <Label htmlFor="emp_name">Nama *</Label>
                            <Input
                                id="emp_name"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee(prev => ({...prev, name: e.target.value}))}
                                placeholder="Nama lengkap"
                            />
                        </div>

                        {/* No. HP */}
                        <div className="space-y-2">
                            <Label htmlFor="emp_phone">No. HP</Label>
                            <Input
                                id="emp_phone"
                                value={newEmployee.phone}
                                onChange={(e) => setNewEmployee(prev => ({...prev, phone: e.target.value}))}
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="emp_role">Role *</Label>
                            <AsyncSelect
                                value={newEmployee.role_id || null}
                                onChange={(value) => {
                                    if (value === null) {
                                        setNewEmployee(prev => ({...prev, role_id: 0, role_name: ''}))
                                    } else {
                                        const roleId = Number(value)
                                        const role = rolesList.find(r => r.id === roleId)
                                        setNewEmployee(prev => ({
                                            ...prev,
                                            role_id: roleId,
                                            role_name: role?.name || ''
                                        }))
                                    }
                                }}
                                loadOptions={roleLoadOptions}
                                placeholder="Pilih Role"
                                defaultOptions
                            />
                        </div>

                        {/* Area */}
                        <div className="space-y-2">
                            <Label htmlFor="emp_area">Area</Label>
                            <AsyncSelect
                                value={newEmployee.area_id || null}
                                onChange={(value) => {
                                    if (value === null) {
                                        setNewEmployee(prev => ({...prev, area_id: undefined, area_name: ''}))
                                    } else {
                                        const areaId = Number(value)
                                        const area = clientAreas.find(a => a.id === areaId)
                                        setNewEmployee(prev => ({
                                            ...prev,
                                            area_id: areaId,
                                            area_name: area?.name || ''
                                        }))
                                    }
                                }}
                                loadOptions={async (search: string) => {
                                    // Use cached clientAreas, filter by search
                                    const searchLower = search.toLowerCase()
                                    return clientAreas
                                        .filter(a => a.name.toLowerCase().includes(searchLower))
                                        .map(a => ({ value: a.id, label: a.name }))
                                }}
                                placeholder="Pilih Area (opsional)"
                                defaultOptions={clientAreas.length > 0}
                            />
                        </div>

                        {/* Gaji / UMK */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="emp_salary">Gaji Riil *</Label>
                                {/* UMK Select */}
                                <div className="w-64">
                                    <AsyncSelect
                                        value={null}
                                        onChange={(value) => {
                                            if (value) {
                                                setNewEmployee(prev => ({...prev, base_salary: String(value)}))
                                            }
                                        }}
                                        loadOptions={async (search: string) => {
                                            try {
                                                const response = await umkApi.getSelectOptions({ q: search })
                                                if (response.success) {
                                                    return response.data.map((u) => ({
                                                        value: u.value, // value is the salary amount
                                                        label: `${u.city} (${u.year}) - ${u.formatted_value}`,
                                                    }))
                                                }
                                                return []
                                            } catch {
                                                return []
                                            }
                                        }}
                                        placeholder="Pilih UMK..."
                                        defaultOptions={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tanggal Join */}
                        <div className="space-y-2">
                            <Label htmlFor="emp_join_date">Tanggal Join *</Label>
                            <Input
                                id="emp_join_date"
                                type="date"
                                value={newEmployee.join_date}
                                onChange={(e) => setNewEmployee(prev => ({...prev, join_date: e.target.value}))}
                            />
                        </div>

                        {/* Add Button */}
                        <div className="flex items-end">
                            <Button onClick={addEmployee} disabled={!isEmployeeValid} className="w-full">
                                <Plus className="h-4 w-4 mr-1"/>
                                Tambah
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!formData.client_id && (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>Pilih Client terlebih dahulu untuk menambahkan employee</p>
                </div>
            )}

            {/* Employee List */}
            {formData.employees.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2">
                        <h3 className="text-sm font-medium">
                            Employee yang Ditambahkan ({formData.employees.length})
                        </h3>
                    </div>
                    <div className="divide-y">
                        {formData.employees.map((emp) => {
                            const result = getEmployeeResult(emp.temp_id)
                            return (
                                <div key={emp.temp_id} className="px-4 py-3 flex items-center gap-4">
                                    {/* Status indicator */}
                                    <div className="shrink-0">
                                        {result?.success === true && (
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="h-4 w-4"/>
                                            </div>
                                        )}
                                        {result?.success === false && (
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center" title={result.error}>
                                                <span className="text-xs font-bold">!</span>
                                            </div>
                                        )}
                                        {!result && (
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                <UserPlus className="h-4 w-4 text-muted-foreground"/>
                                            </div>
                                        )}
                                    </div>

                                    {/* Employee info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{emp.name}</span>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                                {emp.role_name || `Role #${emp.role_id}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            {emp.phone && <span>{emp.phone}</span>}
                                            {emp.area_name && <span>{emp.area_name}</span>}
                                            <span>Rp {emp.base_salary.toLocaleString('id-ID')}</span>
                                            <span>{emp.join_date}</span>
                                        </div>
                                        {result?.success === false && (
                                            <p className="text-xs text-red-600 mt-1">{result.error}</p>
                                        )}
                                        {result?.success === true && result.employee_code && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Dibuat: {result.employee_code}
                                            </p>
                                        )}
                                    </div>

                                    {/* Delete button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeEmployee(emp.temp_id)}
                                        className="text-destructive hover:text-destructive shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {formData.employees.length === 0 && formData.client_id && (
                <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>Belum ada employee ditambahkan</p>
                    <p className="text-xs mt-1">Klik "Tambah" pada form di atas untuk menambahkan employee</p>
                </div>
            )}

            {/* Warning for empty slots */}
            {totalRemaining > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                        ⚠️ Masih ada <strong>{totalRemaining}</strong> slot personnel yang belum diisi.
                        MOU tetap bisa disimpan tanpa employee, dan employee bisa ditambahkan kemudian.
                    </p>
                </div>
            )}
        </div>
    )
}

export default MouWizardModal
