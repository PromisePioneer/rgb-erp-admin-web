/**
 * Approval Types Form Modal (AWAM-Friendly Version)
 * Wizard-style step-by-step dengan visual flow
 * Using AsyncSelect for all dropdowns
 */
import {useEffect, useState, useCallback} from 'react'
import {
    Plus,
    Trash2,
    Users,
    User,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    ArrowRight,
    Building2,
    Briefcase,
    FileText,
    Truck,
    ShoppingCart,
    Clock,
    Shield,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import AsyncSelect, {type SelectOption} from '@/components/async-select'
import {useApprovalTypesStore} from '../store/approval-types-store'
import type {ApprovalType, StepPayload} from '../types/approval-types.types'
import {toast} from 'sonner'

interface ApprovalTypesFormModalProps {
    type: ApprovalType | null
    onClose: () => void
}

interface Template {
    type: string
    name: string
    icon: React.ElementType
    description: string
    steps: Array<{ approver_kind: 'position' | 'role' | 'employee'; label: string }>
}

// Pre-built templates for AWAM users
const TEMPLATES: Template[] = [
    {
        type: 'leave',
        name: 'Pengajuan Cuti',
        icon: Briefcase,
        description: 'Cuti karyawan, izin, sakit',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'position', label: 'Manager Jabatan'},
        ],
    },
    {
        type: 'overtime',
        name: 'Pengajuan Lembur',
        icon: Clock,
        description: 'Surat keterangan lembur',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'position', label: 'Manager Jabatan'},
        ],
    },
    {
        type: 'expense',
        name: 'Pengajuan Biaya',
        icon: FileText,
        description: 'Reimbursement, biaya operasional',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'role', label: 'Finance Role'},
            {approver_kind: 'position', label: 'Manager Jabatan'},
        ],
    },
    {
        type: 'purchase_request',
        name: 'Pengajuan Pembelian',
        icon: ShoppingCart,
        description: 'Permintaan pembelian barang',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'role', label: 'Manager Site Role'},
        ],
    },
    {
        type: 'reimbursement',
        name: 'Pengajuan Klaim/Refund',
        icon: Truck,
        description: 'Klaim asuransi, refund',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'position', label: 'HRD Jabatan'},
            {approver_kind: 'role', label: 'Finance Role'},
        ],
    },
    {
        type: 'data_change',
        name: 'Perubahan Data Karyawan',
        icon: Building2,
        description: 'Update data pribadi, keluarga',
        steps: [
            {approver_kind: 'position', label: 'Supervisor Jabatan'},
            {approver_kind: 'position', label: 'HRD Jabatan'},
        ],
    },
]

export function ApprovalTypesFormModal({type, onClose}: ApprovalTypesFormModalProps) {
    const {
        saveType,
        isSubmitting,
        fetchTypeById,
        positionsOptions,
        rolesOptions,
        employeesOptions,
        fetchPositionsOptions,
        fetchRolesOptions,
        fetchEmployeesOptions,
    } = useApprovalTypesStore()

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        type: '',
        name: '',
        is_active: true,
    })
    const [steps, setSteps] = useState<StepPayload[]>([])

    // Load options on mount
    useEffect(() => {
        fetchPositionsOptions()
        fetchRolesOptions()
        fetchEmployeesOptions()
    }, [])

    useEffect(() => {
        if (type) {
            loadDetail(type.id)
        }
    }, [type])

    const loadDetail = async (id: number) => {
        try {
            await fetchTypeById(id)
            const detail = useApprovalTypesStore.getState().selectedType
            if (detail) {
                setFormData({
                    type: detail.type,
                    name: detail.name,
                    is_active: detail.is_active,
                })
                setSteps(
                    detail.steps.map((s) => ({
                        level: s.level,
                        approver_kind: s.approver_kind as 'position' | 'role' | 'employee',
                        approver_id: s.approver_id,
                    }))
                )
                setStep(2)
            }
        } catch {
            toast.error('Gagal memuat detail')
        }
    }

    const applyTemplate = (template: Template) => {
        setFormData({
            type: template.type,
            name: template.name,
            is_active: true,
        })
        setSteps(
            template.steps.map((s, i) => ({
                level: i + 1,
                approver_kind: s.approver_kind,
                approver_id: 0,
            }))
        )
        setStep(2)
    }

    const addStep = () => {
        setSteps([...steps, {level: steps.length + 1, approver_kind: 'position', approver_id: 0}])
    }

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({...s, level: i + 1}))
        setSteps(newSteps)
    }

    const updateStepKind = (index: number, kind: 'position' | 'role' | 'employee') => {
        const newSteps = [...steps]
        newSteps[index] = {...newSteps[index], approver_kind: kind, approver_id: 0}
        setSteps(newSteps)
    }

    const updateStepApprover = (index: number, value: number | string | null) => {
        const newSteps = [...steps]
        newSteps[index] = {...newSteps[index], approver_id: value as number}
        setSteps(newSteps)
    }

    const handleSubmit = async () => {
        if (!formData.type || !formData.name) {
            toast.error('Nama dan jenis pengajuan harus diisi')
            return
        }

        const invalidSteps = steps.filter((s) => s.approver_id === 0)
        if (invalidSteps.length > 0) {
            toast.error('Semua langkah harus pilih approver')
            return
        }

        const normalizedType = formData.type
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')

        try {
            await saveType(
                {
                    type: normalizedType,
                    name: formData.name,
                    is_active: formData.is_active,
                    steps,
                },
                type?.id
            )
            toast.success(type ? 'Berhasil diupdate' : 'Berhasil dibuat')
            onClose()
        } catch (e: any) {
            toast.error('Gagal menyimpan: ' + (e.message || 'Error'))
        }
    }

    const canProceed = () => {
        if (step === 1) return true
        if (step === 2) return formData.name.length > 0
        return steps.every((s) => s.approver_id > 0)
    }

    // Load options functions for AsyncSelect
    const loadPositions = useCallback(
        async (search: string): Promise<SelectOption[]> => {
            return positionsOptions
                .filter(
                    (p) =>
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.company_name?.toLowerCase().includes(search.toLowerCase())
                )
                .map((p) => ({
                    value: p.id,
                    label: p.name,
                    description: p.company_name || undefined,
                }))
        },
        [positionsOptions]
    )

    const loadRoles = useCallback(
        async (search: string): Promise<SelectOption[]> => {
            return rolesOptions
                .filter(
                    (r) =>
                        r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.description?.toLowerCase().includes(search.toLowerCase())
                )
                .map((r) => ({
                    value: r.id,
                    label: r.name,
                    description: r.description || undefined,
                }))
        },
        [rolesOptions]
    )

    const loadEmployees = useCallback(
        async (search: string): Promise<SelectOption[]> => {
            return employeesOptions
                .filter(
                    (e) =>
                        e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.code?.toLowerCase().includes(search.toLowerCase()) ||
                        e.position_name?.toLowerCase().includes(search.toLowerCase())
                )
                .map((e) => ({
                    value: e.id,
                    label: e.name,
                    description: e.position_name
                        ? `${e.position_name}${e.company_name ? ` (${e.company_name})` : ''}`
                        : e.company_name || undefined,
                }))
        },
        [employeesOptions]
    )

    // Get approver options based on kind
    const getApproverOptions = (kind: 'position' | 'role' | 'employee') => {
        switch (kind) {
            case 'position':
                return loadPositions
            case 'role':
                return loadRoles
            case 'employee':
                return loadEmployees
            default:
                return async () => []
        }
    }

    // Get placeholder based on kind
    const getApproverPlaceholder = (kind: 'position' | 'role' | 'employee') => {
        switch (kind) {
            case 'position':
                return 'Pilih Jabatan...'
            case 'role':
                return 'Pilih Role...'
            case 'employee':
                return 'Pilih Karyawan...'
            default:
                return 'Pilih...'
        }
    }

    // Get label for kind
    const getKindLabel = (kind: 'position' | 'role' | 'employee') => {
        switch (kind) {
            case 'position':
                return 'Jabatan (Mobile)'
            case 'role':
                return 'Role (Website)'
            case 'employee':
                return 'Karyawan (User)'
            default:
                return kind
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                           style={{width: '900px', maxWidth: '95vw'}}>
                <DialogHeader>
                    <DialogTitle>
                        {type ? 'Edit Alur Persetujuan' : 'Buat Alur Persetujuan Baru'}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress Steps */}
                {!type && (
                    <div className="flex items-center justify-center gap-2 py-4 border-b">
                        <StepIndicator
                            number={1}
                            label="Pilih Template"
                            active={step === 1}
                            completed={step > 1}
                        />
                        <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                        <StepIndicator
                            number={2}
                            label="Detail Pengajuan"
                            active={step === 2}
                            completed={step > 2}
                        />
                    </div>
                )}

                <div className="flex-1 overflow-y-auto py-4">
                    {/* STEP 1: Template Selection */}
                    {step === 1 && !type && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-medium mb-2">
                                    Pilih Jenis Pengajuan
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Pilih template yang sesuai atau buat baru
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {TEMPLATES.map((template) => {
                                    const Icon = template.icon
                                    return (
                                        <button
                                            key={template.type}
                                            type="button"
                                            onClick={() => applyTemplate(template)}
                                            className="flex flex-col items-center p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                                        >
                                            <Icon className="h-8 w-8 mb-2 text-primary"/>
                                            <span className="font-medium text-sm">{template.name}</span>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {template.description}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t"/>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-4 text-sm text-muted-foreground">
                                        atau buat baru
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Pengajuan</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                                type: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                                            })
                                        }
                                        placeholder="Contoh: Pengajuan Cuti Khusus"
                                    />
                                </div>
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.name}
                                    className="w-full"
                                >
                                    Lanjut <ChevronRight className="h-4 w-4 ml-1"/>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Detail & Approver Selection */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Pengajuan</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({...formData, name: e.target.value})
                                        }
                                        placeholder="Nama pengajuan"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-medium">Aktifkan Alur</p>
                                        <p className="text-sm text-muted-foreground">
                                            Jika nonaktif, pengajuan langsung disetujui
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({...formData, is_active: checked})
                                        }
                                    />
                                </div>
                            </div>

                            {/* Visual Flow Preview */}
                            {steps.length > 0 && (
                                <div className="border rounded-lg p-4 bg-muted/30">
                                    <p className="text-sm font-medium mb-3">Preview Alur:</p>
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        <div
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            <FileText className="h-4 w-4"/>
                                            Submit
                                        </div>
                                        {steps.map((s, i) => (
                                            <div key={i} className="flex items-center gap-1">
                                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                                <div
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                                                        s.approver_kind === 'position'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : s.approver_kind === 'role'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    <Users className="h-4 w-4"/>
                                                    Step {i + 1}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-1">
                                            <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                            <div
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                                                <CheckCircle className="h-4 w-4"/>
                                                Selesai
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Steps List with AsyncSelect */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Langkah Persetujuan ({steps.length})</Label>
                                    <Button variant="outline" size="sm" onClick={addStep}>
                                        <Plus className="h-4 w-4 mr-1"/>
                                        Tambah Langkah
                                    </Button>
                                </div>

                                {steps.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                                        <p>Belum ada langkah persetujuan</p>
                                        <p className="text-sm">
                                            Klik tombol di atas untuk menambahkan
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {steps.map((stepItem, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2 p-3 border rounded-lg bg-card"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm shrink-0">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {/* Kind Select */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">
                                                            Tipe Approver
                                                        </Label>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    stepItem.approver_kind === 'position'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => updateStepKind(index, 'position')}
                                                            >
                                                                <Briefcase className="h-3 w-3 mr-1"/>
                                                                Jabatan
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    stepItem.approver_kind === 'role'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => updateStepKind(index, 'role')}
                                                            >
                                                                <Shield className="h-3 w-3 mr-1"/>
                                                                Role
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    stepItem.approver_kind === 'employee'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => updateStepKind(index, 'employee')}
                                                            >
                                                                <User className="h-3 w-3 mr-1"/>
                                                                User
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {stepItem.approver_kind === 'position' && 'Untuk pengajuan dari Mobile'}
                                                            {stepItem.approver_kind === 'role' && 'Untuk pengajuan dari Website'}
                                                            {stepItem.approver_kind === 'employee' && 'User tertentu'}
                                                        </p>
                                                    </div>

                                                    {/* Approver Select */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">
                                                            {getKindLabel(stepItem.approver_kind)}
                                                        </Label>
                                                        <AsyncSelect
                                                            value={
                                                                stepItem.approver_id > 0
                                                                    ? stepItem.approver_id
                                                                    : null
                                                            }
                                                            onChange={(value) =>
                                                                updateStepApprover(index, value)
                                                            }
                                                            loadOptions={getApproverOptions(stepItem.approver_kind)}
                                                            placeholder={getApproverPlaceholder(
                                                                stepItem.approver_kind
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive shrink-0"
                                                    onClick={() => removeStep(index)}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                    {step > 1 && !type ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            <ChevronLeft className="h-4 w-4 mr-1"/>
                            Kembali
                        </Button>
                    ) : (
                        <div/>
                    )}

                    {step < 2 && !type ? (
                        <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                            Lanjut
                            <ChevronRight className="h-4 w-4 ml-1"/>
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Step Indicator Component
function StepIndicator({
                           number,
                           label,
                           active,
                           completed,
                       }: {
    number: number
    label: string
    active: boolean
    completed: boolean
}) {
    return (
        <div
            className={`flex items-center gap-2 ${
                active ? 'text-primary' : completed ? 'text-green-600' : 'text-muted-foreground'
            }`}
        >
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                    active
                        ? 'bg-primary text-primary-foreground'
                        : completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-muted'
                }`}
            >
                {completed ? <CheckCircle className="h-4 w-4"/> : number}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{label}</span>
        </div>
    )
}
