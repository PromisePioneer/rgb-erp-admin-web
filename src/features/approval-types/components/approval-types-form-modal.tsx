/**
 * Approval Types Form Modal (User-Friendly)
 * Single form with inline approval steps
 */
import {useEffect, useState} from 'react'
import {Plus, Trash2, Users, User, ChevronUp, ChevronDown} from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {useApprovalTypesStore} from '../store/approval-types-store'
import type {
    ApprovalType,
    StepPayload,
} from '../types/approval-types.types'
import {toast} from 'sonner'

interface ApprovalTypesFormModalProps {
    type: ApprovalType | null
    onClose: () => void
}

export function ApprovalTypesFormModal({type, onClose}: ApprovalTypesFormModalProps) {
    const {
        saveType,
        isSubmitting,
        fetchTypeById,
        positionsOptions,
        employeesOptions,
        fetchPositionsOptions,
        fetchEmployeesOptions
    } = useApprovalTypesStore()

    const [formData, setFormData] = useState({
        type: '',
        name: '',
        is_active: true,
    })

    const [steps, setSteps] = useState<StepPayload[]>([])
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)

    // Load options and detail on mount
    useEffect(() => {
        fetchPositionsOptions()
        fetchEmployeesOptions()

        if (type) {
            loadDetail(type.id)
        }
    }, [type])

    const loadDetail = async (id: number) => {
        setIsLoadingDetail(true)
        try {
            await fetchTypeById(id)
            const detail = useApprovalTypesStore.getState().selectedType
            if (detail) {
                setFormData({
                    type: detail.type,
                    name: detail.name,
                    is_active: detail.is_active,
                })
                setSteps(detail.steps.map(s => ({
                    level: s.level,
                    approver_kind: s.approver_kind,
                    approver_id: s.approver_id,
                })))
            }
        } catch {
            toast.error('Gagal memuat detail')
        } finally {
            setIsLoadingDetail(false)
        }
    }

    const addStep = () => {
        setSteps([...steps, {level: steps.length + 1, approver_kind: 'role', approver_id: 0}])
    }

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index)
            .map((s, i) => ({...s, level: i + 1}))
        setSteps(newSteps)
    }

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newSteps.length) return
            // Swap
            ;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
        // Re-number levels
        newSteps.forEach((s, i) => s.level = i + 1)
        setSteps(newSteps)
    }

    const updateStep = (index: number, field: keyof StepPayload, value: number | string | null) => {
        const newSteps = [...steps]
        newSteps[index] = {...newSteps[index], [field]: value}
        setSteps(newSteps)
    }

    const handleSubmit = async () => {
        if (!formData.type || !formData.name) {
            toast.error('Nama dan kode jenis pengajuan harus diisi')
            return
        }

        // Validate steps
        const invalidSteps = steps.filter(s => s.approver_id === 0)
        if (invalidSteps.length > 0) {
            toast.error('Semua step harus memiliki approver')
            return
        }

        // Normalize type
        const normalizedType = formData.type
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')

        try {
            const payload = {
                type: normalizedType,
                name: formData.name,
                is_active: formData.is_active,
                steps,
            }

            await saveType(payload, type?.id)
            toast.success(type ? 'Berhasil diupdate' : 'Berhasil dibuat')
            onClose()
        } catch {
            toast.error('Gagal menyimpan')
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {type ? 'Edit' : 'Tambah'} Jenis Pengajuan
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Kode</Label>
                            <Input
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                placeholder="Contoh: cuti"
                                disabled={!!type}
                            />
                            <p className="text-xs text-muted-foreground">
                                Kode unik (tanpa spasi). Tidak bisa diubah setelah dibuat.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Contoh: Pengajuan Cuti"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Aktif</Label>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                        />
                    </div>

                    {/* Approval Steps */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Alur Persetujuan</Label>
                            <Button variant="outline" size="sm" onClick={addStep}>
                                <Plus className="h-4 w-4 mr-1"/>
                                Tambah Step
                            </Button>
                        </div>

                        {steps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                                <p>Belum ada alur persetujuan</p>
                                <p className="text-sm">Klik "Tambah Step" untuk menambahkan</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-3 border rounded-lg bg-card"
                                    >
                                        {/* Level indicator */}
                                        <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {step.level}
                      </span>
                                            <div className="flex flex-col">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => moveStep(index, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronUp className="h-3 w-3"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => moveStep(index, 'down')}
                                                    disabled={index === steps.length - 1}
                                                >
                                                    <ChevronDown className="h-3 w-3"/>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Kind selector */}
                                        <Select
                                            value={step.approver_kind}
                                            onValueChange={(value) => updateStep(index, 'approver_kind', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="role">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4"/>
                                                        <span>Jabatan</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="user">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        <span>Karyawan</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Approver selector */}
                                        <Select
                                            value={step.approver_id > 0 ? String(step.approver_id) : undefined}
                                            onValueChange={(value) => updateStep(index, 'approver_id', value ? parseInt(value) : 0)}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Pilih approver..."/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {step.approver_kind === 'role' ? (
                                                    positionsOptions.map((pos) => (
                                                        <SelectItem key={pos.id} value={String(pos.id)}>
                                                            {pos.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    employeesOptions.map((emp) => (
                                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                                            <div className="flex flex-col">
                                                                <span>{emp.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                  {emp.position_name || emp.code}
                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {/* Delete */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
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

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingDetail}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
