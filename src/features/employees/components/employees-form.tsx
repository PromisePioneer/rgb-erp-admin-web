/**
 * Employees Form Page Component
 * Full page form for create/edit employee with multiple sections
 */
import {useEffect, useRef, useState} from 'react'
import {useParams, useNavigate} from '@tanstack/react-router'
import {ArrowLeft, Save, Plus, Trash2} from 'lucide-react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {positionsApi} from '@/features/positions/api/positions-api'
import {provincesApi} from '@/features/provinces/api/provinces-api'
import {employeesApi} from '../api/employees-api'
import {areasApi} from '@/features/areas/api/areas-api'
import {possApi} from '@/features/poss/api/poss-api'
import {useEmployeesStore} from '@/features/employees'
import {useEmployeeCode} from '@/features/employees'
import {EmployeeCodeField} from '@/features/employees'
import type {CreateEmployeePayload} from '@/features/employees'

// Position names that REQUIRE client_id, area_id, pos_id
const REQUIRED_PLACEMENT_POSITIONS = [
    'Security Guard',
    'Chief',
    'Danru',
    'Valet',
    'Cleaning Service',
]

export function EmployeesForm() {
    const {id} = useParams({strict: false}) as { id?: string }
    const navigate = useNavigate()
    const isEdit = Boolean(id)

    const {
        selectedItem,
        isLoading,
        isSubmitting,
        fetchById,
        create,
        update,
        resetForm,
    } = useEmployeesStore()

    const hasShownValidationToast = useRef(false)

    // Form sections state
    const [children, setChildren] = useState<Array<{
        name: string;
        birth_date: string;
        birth_place: string;
        education: string
    }>>([])
    const [siblings, setSiblings] = useState<Array<{
        type: string;
        name: string;
        age: string;
        education: string;
        job: string
    }>>([])
    const [educations, setEducations] = useState<Array<{
        from: string;
        to: string;
        school: string;
        city: string;
        cert: boolean
    }>>([])
    const [trainings, setTrainings] = useState<Array<{ course: string; duration: string; location: string }>>([])
    const [languages, setLanguages] = useState<Array<{
        name: string;
        written: string;
        spoken: string;
        notes: string
    }>>([])
    const [socialActivities, setSocialActivities] = useState<Array<{
        organization_name: string;
        year: string;
        position: string;
        notes: string;
    }>>([])
    const [selectedPositionName, setSelectedPositionName] = useState<string | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    // Check if selected position requires placement fields
    const isPlacementRequired = REQUIRED_PLACEMENT_POSITIONS.includes(selectedPositionName || '')

    // Employee code generation
    const {
        code: _generatedCode,
        isLoading: isGeneratingCode,
        error: codeError,
        generateCode,
        clearCode
    } = useEmployeeCode({
        onCodeGenerated: (code) => {
            if (code) {
                form.setValue('code', code, {shouldValidate: true})
            }
        },
    })

    const form = useForm<CreateEmployeePayload>({
        defaultValues: {
            company_id: undefined,
            position_id: undefined,
            province_id: undefined,
            client_id: undefined,
            area_id: undefined,
            pos_id: undefined,
            code: '',
            name: '',
            phone: '',
            birth_date: '',
            birth_place: '',
            address: '',
            address2: '',
            religion: '',
            id_card: '',
            blood_type: '',
            height: undefined,
            weight: undefined,
            marital_status: '',
            marriage_date: '',
            divorced_date: '',
            father_name: '',
            mother_name: '',
            parent_address: '',
            parent_phone: '',
            father_occupation: '',
            mother_occupation: '',
            spouse_name: '',
            spouse_birth_date: '',
            spouse_birth_place: '',
            spouse_education: '',
            spouse_occupation: '',
            housing_status: '',
            base_salary: undefined,
            ptkp_status: '',
            join_date: '',
            bpjs_health: false,
            bpjs_employment: false,
            drive_license_type: '',
            drive_license_number: '',
            status: 1,
        },
    })

    // Fetch employee data for edit
    useEffect(() => {
        if (isEdit && id) {
            fetchById(Number(id))
        } else {
            resetForm()
        }
    }, [isEdit, id, fetchById, resetForm])

    // Populate form when data loaded
    useEffect(() => {
        if (isEdit && selectedItem) {
            form.reset({
                company_id: selectedItem.company_id ?? undefined,
                position_id: selectedItem.position_id ?? undefined,
                province_id: selectedItem.province_id ?? undefined,
                client_id: selectedItem.client_id ?? undefined,
                area_id: selectedItem.area_id ?? undefined,
                pos_id: selectedItem.pos_id ?? undefined,
                code: selectedItem.code ?? '',
                name: selectedItem.name ?? '',
                phone: selectedItem.phone ?? '',
                birth_date: selectedItem.birth_date ?? '',
                birth_place: selectedItem.birth_place ?? '',
                address: selectedItem.address ?? '',
                address2: selectedItem.address2 ?? '',
                religion: selectedItem.religion ?? '',
                id_card: selectedItem.id_card ?? '',
                blood_type: selectedItem.blood_type ?? '',
                height: selectedItem.height ?? undefined,
                weight: selectedItem.weight ?? undefined,
                marital_status: selectedItem.marital_status ?? '',
                marriage_date: selectedItem.marriage_date ?? '',
                divorced_date: selectedItem.divorced_date ?? '',
                father_name: selectedItem.father_name ?? '',
                mother_name: selectedItem.mother_name ?? '',
                parent_address: selectedItem.parent_address ?? '',
                parent_phone: selectedItem.parent_phone ?? '',
                father_occupation: selectedItem.father_occupation ?? '',
                mother_occupation: selectedItem.mother_occupation ?? '',
                spouse_name: selectedItem.spouse_name ?? '',
                spouse_birth_date: selectedItem.spouse_birth_date ?? '',
                spouse_birth_place: selectedItem.spouse_birth_place ?? '',
                spouse_education: selectedItem.spouse_education ?? '',
                spouse_occupation: selectedItem.spouse_occupation ?? '',
                housing_status: selectedItem.housing_status ?? '',
                base_salary: selectedItem.base_salary ?? undefined,
                ptkp_status: selectedItem.ptkp_status ?? '',
                join_date: selectedItem.join_date ?? '',
                bpjs_health: selectedItem.bpjs_health ?? false,
                bpjs_employment: selectedItem.bpjs_employment ?? false,
                drive_license_type: selectedItem.drive_license_type ?? '',
                drive_license_number: selectedItem.drive_license_number ?? '',
                status: selectedItem.status ?? 1,
            })

            // Set selected position name for conditional validation
            setSelectedPositionName(selectedItem.position_name || null)

            // Set photo preview if exists
            if (selectedItem.photo) {
                setPhotoPreview(`/storage/${selectedItem.photo}`)
            } else {
                setPhotoPreview(null)
            }

            const _childArray = (selectedItem.children ?? []).map((c) => ({
                name: c.name || '',
                birth_date: c.birth_date || '',
                birth_place: c.birth_place || '',
                education: c.education || '',
            }))
            setChildren(_childArray)

            const _siblingArray = (selectedItem.siblings ?? []).map((s) => ({
                type: s.type || '',
                name: s.name || '',
                age: String(s.age ?? ''),
                education: s.education || '',
                job: s.job || '',
            }))
            setSiblings(_siblingArray)

            const _educationArray = (selectedItem.educations ?? []).map((e) => ({
                from: e.from ? String(e.from) : '',
                to: e.to ? String(e.to) : '',
                school: e.school || '',
                city: e.city || '',
                cert: e.cert || false,
            }))
            setEducations(_educationArray)

            const _trainingArray = (selectedItem.trainings ?? []).map((t) => ({
                course: t.course || '',
                duration: t.duration || '',
                location: t.location || '',
            }))
            setTrainings(_trainingArray)

            const _languageArray = (selectedItem.languages ?? []).map((l) => ({
                name: l.name || '',
                written: l.written || '',
                spoken: l.spoken || '',
                notes: l.notes || '',
            }))
            setLanguages(_languageArray)

            const _socialActivityArray = (selectedItem.social_activities ?? []).map((s) => ({
                organization_name: s.organization_name || '',
                year: s.year || '',
                position: s.position || '',
                notes: s.notes || '',
            }))
            setSocialActivities(_socialActivityArray)
        }
    }, [isEdit, selectedItem, form])

    // Validation error toast
    useEffect(() => {
        const errors = form.formState.errors
        const errorCount = Object.keys(errors).length

        if (errorCount > 0 && form.formState.submitCount > 0 && !hasShownValidationToast.current) {
            hasShownValidationToast.current = true
            toast.error(`${errorCount} validation errors found. Please check the form.`)
        }

        if (errorCount === 0) {
            hasShownValidationToast.current = false
        }
    }, [form, form.formState.errors, form.formState.submitCount])

    const handleClose = () => {
        navigate({to: '/employees'})
    }

    const onSubmit = async (values: CreateEmployeePayload) => {
        // Prepare payload with dynamic arrays
        const payload: CreateEmployeePayload = {
            ...values,
            children_name: children.map((c) => c.name).filter(Boolean),
            children_birth_date: children.map((c) => c.birth_date).filter(Boolean),
            children_birth_place: children.map((c) => c.birth_place).filter(Boolean),
            children_education: children.map((c) => c.education).filter(Boolean),
            sibling_type: siblings.map((s) => s.type).filter(Boolean),
            sibling_name: siblings.map((s) => s.name).filter(Boolean),
            sibling_age: siblings.map((s) => (s.age ? parseInt(s.age) : undefined)).filter((a) => a !== undefined) as number[] | undefined,
            sibling_education: siblings.map((s) => s.education).filter(Boolean),
            sibling_job: siblings.map((s) => s.job).filter(Boolean),
            education_from: educations.map((e) => (e.from ? parseInt(e.from) : undefined)).filter((v) => v !== undefined) as number[] | undefined,
            education_to: educations.map((e) => (e.to ? parseInt(e.to) : undefined)).filter((v) => v !== undefined) as number[] | undefined,
            education_school: educations.map((e) => e.school).filter(Boolean),
            education_city: educations.map((e) => e.city).filter(Boolean),
            education_certificate: educations.map((e) => e.cert),
            training_course: trainings.map((t) => t.course).filter(Boolean),
            training_duration: trainings.map((t) => t.duration).filter(Boolean),
            training_location: trainings.map((t) => t.location).filter(Boolean),
            language_name: languages.map((l) => l.name).filter(Boolean),
            language_written: languages.map((l) => l.written).filter(Boolean),
            language_spoken: languages.map((l) => l.spoken).filter(Boolean),
            language_notes: languages.map((l) => l.notes).filter(Boolean),
            // Social activity fields
            social_activity_organization: socialActivities.map((s) => s.organization_name).filter(Boolean),
            social_activity_year: socialActivities.map((s) => s.year).filter(Boolean),
            social_activity_position: socialActivities.map((s) => s.position).filter(Boolean),
            social_activity_notes: socialActivities.map((s) => s.notes).filter(Boolean),
        }

        try {
            if (isEdit && id) {
                await update(Number(id), payload)
                toast.success('Employee updated successfully')
                handleClose()
            } else {
                await create(payload)
                toast.success('Employee created successfully')
                handleClose()
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    // Load positions for dropdown
    const loadPositions = async (search: string): Promise<SelectOption[]> => {
        const response = await positionsApi.getSelectOptions({q: search})
        return response.data.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    }

    // Load provinces for dropdown
    const loadProvinces = async (search: string): Promise<SelectOption[]> => {
        const response = await provincesApi.getSelectOptions({q: search})
        return response.data.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    }

    // Load clients for dropdown (for placement)
    const loadClients = async (search: string): Promise<SelectOption[]> => {
        const response = await employeesApi.getClientsSelectOptions({q: search})
        return response.data.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    }

    // Load areas for a client
    const loadAreas = async (search: string, clientId?: number): Promise<SelectOption[]> => {
        if (!clientId) return []
        const response = await areasApi.getSelectOptions({client_id: clientId, q: search})
        return response.data.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    }

    // Load poss for an area
    const loadPoss = async (search: string, areaId?: number): Promise<SelectOption[]> => {
        if (!areaId) return []
        const response = await possApi.getSelectOptions({area_id: areaId, q: search})
        return response.data.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    }

    // Handle client selection with auto-assignment logic
    const handleClientChange = async (value: number | string | null) => {
        const clientId = value ? Number(value) : null
        form.setValue('client_id', clientId as number | null | undefined, {shouldValidate: true})

        if (clientId && isPlacementRequired) {
            // Fetch areas for this client
            const areas = await loadAreas('', clientId)

            if (areas.length === 1) {
                // Auto-assign area if only 1
                const areaId = areas[0].value as number
                form.setValue('area_id', areaId as number | null | undefined, {shouldValidate: true})

                // Fetch poss for this area
                const poss = await loadPoss('', areaId)
                if (poss.length === 1) {
                    // Auto-assign pos if only 1
                    form.setValue('pos_id', poss[0].value as number | null | undefined, {shouldValidate: true})
                } else {
                    // Reset pos if multiple poss
                    form.setValue('pos_id', undefined)
                }
            } else {
                // Reset area and pos if multiple areas
                form.setValue('area_id', undefined)
                form.setValue('pos_id', undefined)
            }
        } else {
            // Reset area and pos if no client or not required
            form.setValue('area_id', undefined)
            form.setValue('pos_id', undefined)
        }
    }

    // Handle area selection
    const handleAreaChange = async (value: number | string | null) => {
        const areaId = value ? Number(value) : null
        form.setValue('area_id', areaId as number | null | undefined, {shouldValidate: true})

        if (areaId && isPlacementRequired) {
            // Fetch poss for this area
            const poss = await loadPoss('', areaId)
            if (poss.length === 1) {
                // Auto-assign pos if only 1
                form.setValue('pos_id', poss[0].value as number | null | undefined, {shouldValidate: true})
            } else {
                // Reset pos if multiple poss
                form.setValue('pos_id', undefined)
            }
        } else {
            form.setValue('pos_id', undefined)
        }
    }

    // Helper to get join year from join_date
    const getJoinYear = (): number | undefined => {
        const joinDate = form.getValues('join_date')
        if (joinDate) {
            const date = new Date(joinDate)
            if (!isNaN(date.getTime())) {
                return date.getFullYear()
            }
        }
        return undefined
    }

    // Handle province selection change - generate employee code
    const handleProvinceChange = async (value: number | string | null) => {
        const provinceId = value ? Number(value) : null
        form.setValue('province_id', provinceId as number | null | undefined, {shouldValidate: true})

        if (provinceId) {
            // Get company_id and join_year from form values
            const companyId = form.getValues('company_id')
            const joinYear = getJoinYear()
            await generateCode(provinceId, companyId ?? undefined, joinYear)
        } else {
            clearCode()
            form.setValue('code', '', {shouldValidate: true})
        }
    }
    // Handle join date change - regenerate employee code if province is selected
    const handleJoinDateChange = async (value: string) => {
        form.setValue('join_date', value, {shouldValidate: true})

        // Regenerate code if province is already selected
        const provinceId = form.getValues('province_id')
        if (provinceId) {
            const companyId = form.getValues('company_id')
            const joinYear = getJoinYear()
            await generateCode(provinceId, companyId ?? undefined, joinYear)
        }
    }

    // Dynamic array handlers
    const addChild = () => setChildren([...children, {name: '', birth_date: '', birth_place: '', education: ''}])
    const updateChild = (index: number, field: string, value: string) => {
        const updated = [...children]
        updated[index] = {...updated[index], [field]: value}
        setChildren(updated)
    }
    const removeChild = (index: number) => setChildren(children.filter((_, i) => i !== index))

    // Siblings section intentionally omitted (not included in API response)

    const addEducation = () => setEducations([...educations, {from: '', to: '', school: '', city: '', cert: false}])
    const updateEducation = (index: number, field: string, value: string | boolean) => {
        const updated = [...educations]
        updated[index] = {...updated[index], [field]: value}
        setEducations(updated)
    }
    const removeEducation = (index: number) => setEducations(educations.filter((_, i) => i !== index))

    const addTraining = () => setTrainings([...trainings, {course: '', duration: '', location: ''}])
    const updateTraining = (index: number, field: string, value: string) => {
        const updated = [...trainings]
        updated[index] = {...updated[index], [field]: value}
        setTrainings(updated)
    }
    const removeTraining = (index: number) => setTrainings(trainings.filter((_, i) => i !== index))

    const addLanguage = () => setLanguages([...languages, {name: '', written: '', spoken: '', notes: ''}])
    const updateLanguage = (index: number, field: string, value: string) => {
        const updated = [...languages]
        updated[index] = {...updated[index], [field]: value}
        setLanguages(updated)
    }
    const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index))

    // Social activity handlers
    const addSocialActivity = () => setSocialActivities([...socialActivities, {
        organization_name: '',
        year: '',
        position: '',
        notes: ''
    }])
    const updateSocialActivity = (index: number, field: string, value: string) => {
        const updated = [...socialActivities]
        updated[index] = {...updated[index], [field]: value}
        setSocialActivities(updated)
    }
    const removeSocialActivity = (index: number) => setSocialActivities(socialActivities.filter((_, i) => i !== index))

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <ArrowLeft className="h-5 w-5"/>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
                        <p className="text-muted-foreground">Fill in the employee details below</p>
                    </div>
                </div>
                <Button type="submit" form="employee-form" disabled={isSubmitting || isLoading}>
                    <Save className="h-4 w-4 mr-2"/>
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>

            <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Private Information */}
                <section className="bg-card rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Private Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name *</label>
                            <Input {...form.register('name', {required: 'Name is required'})}
                                   placeholder="John Doe"/>
                            {form.formState.errors.name &&
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Photo</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null
                                    form.setValue('photo', file)
                                }}
                                className="w-full"
                            />
                            {photoPreview && (
                                <img src={photoPreview} alt="Preview"
                                     className="mt-2 h-20 w-20 object-cover rounded-md"/>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Birth Date</label>
                            <Input type="date" {...form.register('birth_date')} />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium">Address 1</label>
                        <textarea {...form.register('address')} placeholder="Street address"
                                  className="w-full min-h-20 px-3 py-2 text-sm rounded-md border border-input"/>
                    </div>
                    <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium">Address 2</label>
                        <textarea {...form.register('address2')} placeholder="Street address"
                                  className="w-full min-h-20 px-3 py-2 text-sm rounded-md border border-input"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input {...form.register('phone')} placeholder="08123456789"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Religion</label>
                            <select {...form.register('religion')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ID Card (KTP)</label>
                            <Input {...form.register('id_card')} placeholder="1234567890123456"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Blood Type</label>
                            <select {...form.register('blood_type')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="AB">AB</option>
                                <option value="O">O</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marital Status</label>
                            <select {...form.register('marital_status')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spouse Name</label>
                            <Input {...form.register('spouse_name')} placeholder="John's Spouse"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spouse Birth Date</label>
                            <Input type="date" {...form.register('spouse_birth_date')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spouse Education</label>
                            <Input {...form.register('spouse_education')} placeholder="S1"/>
                        </div>
                        <div className="space-y-2 mb-6">
                            <label className="text-sm font-medium">Spouse Occupation</label>
                            <Input {...form.register('spouse_occupation')} placeholder="Private Employee"/>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Children</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addChild}>
                                <Plus className="h-4 w-4 mr-1"/> Add Child
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {children.map((child, index) => (
                                <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        <Input
                                            placeholder="Child's Name"
                                            value={child.name}
                                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                                        />
                                        <Input
                                            type="date"
                                            placeholder="Birth Date"
                                            value={child.birth_date}
                                            onChange={(e) => updateChild(index, 'birth_date', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Birth Place"
                                            value={child.birth_place}
                                            onChange={(e) => updateChild(index, 'birth_place', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Education"
                                            value={child.education}
                                            onChange={(e) => updateChild(index, 'education', e.target.value)}
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon"
                                            onClick={() => removeChild(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                            {children.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No children added</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Basic Information */}
                <section className="bg-card rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Position</label>
                            <AsyncSelect
                                value={form.watch('position_id') ?? null}
                                onChange={async (value) => {
                                    const positionId = value as number | null
                                    form.setValue('position_id', positionId as number | null | undefined, {shouldValidate: true})

                                    // Get position name from selected item or API
                                    if (positionId) {
                                        const positions = await loadPositions('')
                                        const selectedPosition = positions.find(p => p.value === positionId)
                                        const positionName = selectedPosition?.label || null
                                        setSelectedPositionName(positionName)

                                        // Reset placement fields if not required
                                        if (!REQUIRED_PLACEMENT_POSITIONS.includes(positionName || '')) {
                                            form.setValue('client_id', undefined)
                                            form.setValue('area_id', undefined)
                                            form.setValue('pos_id', undefined)
                                        }
                                    } else {
                                        setSelectedPositionName(null)
                                    }
                                }}
                                loadOptions={loadPositions}
                                placeholder="Select position..."
                                className="w-full"
                            />
                        </div>


                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Client (Placement) {isPlacementRequired && <span className="text-red-500">*</span>}
                                {!isPlacementRequired && selectedPositionName && (
                                    <span
                                        className="text-muted-foreground font-normal ml-1">(Optional for Back Office)</span>
                                )}
                            </label>
                            <AsyncSelect
                                value={form.watch('client_id') ?? null}
                                onChange={handleClientChange}
                                loadOptions={loadClients}
                                placeholder="Select client..."
                                className="w-full"
                                isDisabled={!isPlacementRequired}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Area {isPlacementRequired && <span className="text-red-500">*</span>}
                            </label>
                            <AsyncSelect
                                value={form.watch('area_id') ?? null}
                                onChange={handleAreaChange}
                                loadOptions={(search) => loadAreas(search, form.getValues('client_id') as number | undefined)}
                                placeholder="Select area..."
                                className="w-full"
                                isDisabled={!form.watch('client_id') || !isPlacementRequired}
                            />
                        </div>


                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                POS {isPlacementRequired && <span className="text-red-500">*</span>}
                            </label>
                            <AsyncSelect
                                value={form.watch('pos_id') ?? null}
                                onChange={(value) => form.setValue('pos_id', value as number | null | undefined, {shouldValidate: true})}
                                loadOptions={(search) => loadPoss(search, form.getValues('area_id') as number | undefined)}
                                placeholder="Select POS..."
                                className="w-full"
                                isDisabled={!form.watch('area_id') || !isPlacementRequired}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Province</label>
                            <AsyncSelect
                                value={form.watch('province_id') ?? null}
                                onChange={handleProvinceChange}
                                loadOptions={loadProvinces}
                                placeholder="Select province..."
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <EmployeeCodeField
                                value={form.watch('code')}
                                isLoading={isGeneratingCode}
                                error={codeError}
                                disabled={isEdit}
                            />
                        </div>


                        <div className="space-y-2">
                            <label className="text-sm font-medium">Birth Place</label>
                            <Input {...form.register('birth_place')} placeholder="Jakarta"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Height (cm)</label>
                            <Input type="number" {...form.register('height', {valueAsNumber: true})}
                                   placeholder="170"/>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Weight (kg)</label>
                            <Input type="number" {...form.register('weight', {valueAsNumber: true})}
                                   placeholder="65"/>
                        </div>
                    </div>
                </section>


                {/* Family Information */}
                <section className="bg-card rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Family Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Father's Name</label>
                            <Input {...form.register('father_name')} placeholder="John's Father"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mother's Name</label>
                            <Input {...form.register('mother_name')} placeholder="John's Mother"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Emergency Contact</label>
                            <Input {...form.register('parent_phone')} placeholder="08123456789"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Father's Occupation</label>
                            <Input {...form.register('father_occupation')} placeholder="Farmer"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mother's Occupation</label>
                            <Input {...form.register('mother_occupation')} placeholder="Housewife"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marriage Date</label>
                            <Input type="date" {...form.register('marriage_date')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Divorced Date</label>
                            <Input type="date" {...form.register('divorced_date')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Housing Status</label>
                            <select {...form.register('housing_status')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="owned">Owned</option>
                                <option value="rented">Rented</option>
                                <option value="living_with_parents">Living with Parents</option>
                                <option value="company_owned">Company Owned</option>
                            </select>
                        </div>
                    </div>
                </section>


                {/* Work Information */}
                <section className="bg-card rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Work Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Join Date</label>
                            <Input
                                type="date"
                                {...form.register('join_date')}
                                onChange={(e) => handleJoinDateChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Base Salary</label>
                            <Input type="number" {...form.register('base_salary', {valueAsNumber: true})}
                                   placeholder="5000000"/>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">PTKP Status</label>
                            <select {...form.register('ptkp_status')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="TK/0">TK/0 (Tidak Kawin)</option>
                                <option value="TK/1">TK/1</option>
                                <option value="TK/2">TK/2</option>
                                <option value="TK/3">TK/3</option>
                                <option value="K/0">K/0 (Kawin)</option>
                                <option value="K/1">K/1</option>
                                <option value="K/2">K/2</option>
                                <option value="K/3">K/3</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver License Type</label>
                            <select {...form.register('drive_license_type')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select...</option>
                                <option value="A">A (Motor)</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C">C (Mobil)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver License Number</label>
                            <Input {...form.register('drive_license_number')} placeholder="123456789"/>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select {...form.register('status', {valueAsNumber: true})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register('bpjs_health')} className="rounded"/>
                                <span className="text-sm">BPJS Kesehatan</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register('bpjs_employment')} className="rounded"/>
                                <span className="text-sm">BPJS Ketenagakerjaan</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Education Section */}
                <section className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Education History</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                            <Plus className="h-4 w-4 mr-1"/> Add Education
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {educations.map((edu, index) => (
                            <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
                                <div className="flex-1 grid grid-cols-5 gap-4">
                                    <Input
                                        type="number"
                                        placeholder="From Year"
                                        value={edu.from}
                                        onChange={(e) => updateEducation(index, 'from', e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="To Year"
                                        value={edu.to}
                                        onChange={(e) => updateEducation(index, 'to', e.target.value)}
                                    />
                                    <Input
                                        placeholder="School Name"
                                        value={edu.school}
                                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                    />
                                    <Input
                                        placeholder="City"
                                        value={edu.city}
                                        onChange={(e) => updateEducation(index, 'city', e.target.value)}
                                    />
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={edu.cert}
                                            onChange={(e) => updateEducation(index, 'cert', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Certificate</span>
                                    </label>
                                </div>
                                <Button type="button" variant="ghost" size="icon"
                                        onClick={() => removeEducation(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                        {educations.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No education added</p>
                        )}
                    </div>
                </section>
                {/* Social Activity Section */}
                <section className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Social Activities</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addSocialActivity}>
                            <Plus className="h-4 w-4 mr-1"/> Add Social Activity
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {socialActivities.map((activity, index) => (
                            <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                    <Input
                                        placeholder="Organization Name"
                                        value={activity.organization_name}
                                        onChange={(e) => updateSocialActivity(index, 'organization_name', e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Year"
                                        value={activity.year}
                                        onChange={(e) => updateSocialActivity(index, 'year', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Position"
                                        value={activity.position}
                                        onChange={(e) => updateSocialActivity(index, 'position', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Notes"
                                        value={activity.notes}
                                        onChange={(e) => updateSocialActivity(index, 'notes', e.target.value)}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon"
                                        onClick={() => removeSocialActivity(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                        {socialActivities.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No social activities added</p>
                        )}
                    </div>
                </section>

                {/* Training Section */}
                <section className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Training / Course</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addTraining}>
                            <Plus className="h-4 w-4 mr-1"/> Add Training
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {trainings.map((training, index) => (
                            <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    <Input
                                        placeholder="Course Name"
                                        value={training.course}
                                        onChange={(e) => updateTraining(index, 'course', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Duration"
                                        value={training.duration}
                                        onChange={(e) => updateTraining(index, 'duration', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Location"
                                        value={training.location}
                                        onChange={(e) => updateTraining(index, 'location', e.target.value)}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon"
                                        onClick={() => removeTraining(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                        {trainings.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No training added</p>
                        )}
                    </div>
                </section>

                {/* Language Section */}
                <section className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Language Skills</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                            <Plus className="h-4 w-4 mr-1"/> Add Language
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {languages.map((lang, index) => (
                            <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                    <Input
                                        placeholder="Language"
                                        value={lang.name}
                                        onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                                    />
                                    <select
                                        value={lang.written}
                                        onChange={(e) => updateLanguage(index, 'written', e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Written Level</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Good">Good</option>
                                        <option value="Excellent">Excellent</option>
                                    </select>
                                    <select
                                        value={lang.spoken}
                                        onChange={(e) => updateLanguage(index, 'spoken', e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Spoken Level</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Good">Good</option>
                                        <option value="Excellent">Excellent</option>
                                    </select>
                                    <Input
                                        placeholder="Notes"
                                        value={lang.notes}
                                        onChange={(e) => updateLanguage(index, 'notes', e.target.value)}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon"
                                        onClick={() => removeLanguage(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                        {languages.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No languages added</p>
                        )}
                    </div>
                </section>
                {/* Submit Button */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        <Save className="h-4 w-4 mr-2"/>
                        {isSubmitting ? 'Saving...' : 'Save Employee'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
