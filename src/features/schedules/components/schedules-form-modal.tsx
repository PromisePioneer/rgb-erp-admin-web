/**
 * Schedules Form Modal Component
 * Create and edit form using react-hook-form with cascading dropdowns
 */
import {useEffect, useRef, useCallback, useState} from 'react'
import {useForm} from 'react-hook-form'
import {Save, Calendar, MapPin} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {useSchedulesStore} from '../store/schedules-store'
import {schedulesApi} from '../api/schedules-api'
import {useSelectOptionsCacheStore} from '@/stores/select-options-cache-store'

interface SchedulesFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: 'create' | 'edit'
    scheduleId?: number
    defaultEmployeeId?: number
    defaultDate?: string
}

type ScheduleFormValues = {
    employee_id: number | undefined
    date: string
    shift_id: number | undefined
    area_id: number | undefined
    pos_id: number | undefined
}

export function SchedulesFormModal({
                                       open,
                                       onOpenChange,
                                       mode,
                                       scheduleId,
                                       defaultEmployeeId,
                                       defaultDate,
                                   }: SchedulesFormModalProps) {
    const {
        selectedItem,
        isLoading,
        isSubmitting,
        fetchById,
        create,
        update,
        resetForm,
    } = useSchedulesStore()

    const {getCache, setCache} = useSelectOptionsCacheStore()

    const hasShownValidationToast = useRef(false)
    const [defaultShiftOption, setDefaultShiftOption] = useState<SelectOption | null>(null)
    const [defaultEmployeeOption, setDefaultEmployeeOption] = useState<SelectOption | null>(null)

    const form = useForm<ScheduleFormValues>({
        defaultValues: {
            employee_id: undefined,
            date: defaultDate ?? new Date().toISOString().split('T')[0],
            shift_id: undefined,
            area_id: undefined,
            pos_id: undefined,
        },
    })

    // Reset form when modal closes or defaults change
    useEffect(() => {
        if (!open) {
            form.reset({
                employee_id: undefined,
                date: new Date().toISOString().split('T')[0],
                shift_id: undefined,
                area_id: undefined,
                pos_id: undefined,
            })
            hasShownValidationToast.current = false
        } else {
            // Set defaults from calendar click
            if (defaultEmployeeId && mode === 'create') {
                form.setValue('employee_id', defaultEmployeeId)
            }
            if (defaultDate && mode === 'create') {
                form.setValue('date', defaultDate)
            }
        }
    }, [open, defaultEmployeeId, defaultDate, mode, form])

    // Show validation errors as toast
    useEffect(() => {
        const errors = form.formState.errors
        const errorCount = Object.keys(errors).length

        if (errorCount > 0 && form.formState.submitCount > 0 && !hasShownValidationToast.current) {
            hasShownValidationToast.current = true

            const errorMessages = Object.values(errors)
                .map((error) => error?.message)
                .filter(Boolean) as string[]

            if (errorMessages.length === 1) {
                toast.error(errorMessages[0])
            } else if (errorMessages.length > 1) {
                toast.error(`${errorMessages.length} validation errors found. Please check the form.`)
            }
        }

        if (errorCount === 0) {
            hasShownValidationToast.current = false
        }
    }, [form, form.formState.errors, form.formState.submitCount])

    // Effect 1: Fetch data when scheduleId changes
    useEffect(() => {
        console.log('Effect 1 - mode:', mode, 'scheduleId:', scheduleId, 'open:', open)
        if (mode === 'edit' && scheduleId && open) {
            console.log('Calling fetchById with:', scheduleId)
            fetchById(scheduleId)
        }
        if (mode === 'create' && open) {
            resetForm()
        }
    }, [mode, scheduleId, open, fetchById, resetForm])

    // Effect 2: Pre-load data when selectedItem is available
    useEffect(() => {
        if (!selectedItem) return

        if (mode === 'edit') {
            // Pre-load employee
            if (selectedItem.employee_id) {
                if (selectedItem.employee_name) {
                    setDefaultEmployeeOption({
                        value: selectedItem.employee_id,
                        label: `${selectedItem.employee_name} (${selectedItem.employee_code})`,
                    })
                } else {
                    schedulesApi.getEmployeesSelectOptions({q: ''}).then(response => {
                        const found = response.data.find((e: {id: number}) => e.id === selectedItem.employee_id)
                        if (found) {
                            setDefaultEmployeeOption({
                                value: found.id,
                                label: `${found.name} (${found.code})`,
                            })
                        }
                    }).catch(() => {})
                }
            } else {
                setDefaultEmployeeOption(null)
            }

            // Pre-load shift
            if (selectedItem.shift_id) {
                schedulesApi.getShiftsSelectOptions({q: ''}).then(response => {
                    const found = response.data.find((s: {id: number}) => s.id === selectedItem.shift_id)
                    if (found) {
                        setDefaultShiftOption({
                            value: found.id,
                            label: `${found.name} (${found.start_time} - ${found.end_time})`,
                        })
                    }
                }).catch(() => {})
            } else {
                setDefaultShiftOption(null)
            }
        } else if (mode === 'create' && defaultEmployeeId) {
            // Pre-load employee for create mode
            schedulesApi.getEmployeesSelectOptions({q: ''}).then(response => {
                const found = response.data.find((e: {id: number}) => e.id === defaultEmployeeId)
                if (found) {
                    setDefaultEmployeeOption({
                        value: found.id,
                        label: `${found.name} (${found.code})`,
                    })
                }
            }).catch(() => {})
        } else if (mode === 'create') {
            setDefaultEmployeeOption(null)
            setDefaultShiftOption(null)
        }
    }, [mode, selectedItem, defaultEmployeeId])

    // Populate form when data is loaded
    useEffect(() => {
        if (mode === 'edit' && selectedItem && open) {
            form.reset({
                employee_id: selectedItem.employee_id,
                date: selectedItem.date,
                shift_id: selectedItem.shift_id ?? undefined,
                area_id: selectedItem.area_id ?? undefined,
                pos_id: selectedItem.pos_id ?? undefined,
            })
        }
    }, [mode, selectedItem, open, form])

    // Load shifts options with cache
    const loadShifts = useCallback(async (search: string): Promise<SelectOption[]> => {
        // Only cache initial load (search == '')
        if (search === '') {
            const cached = getCache('shifts')
            if (cached) {
                return cached
            }
        }

        try {
            const response = await schedulesApi.getShiftsSelectOptions({q: search})
            const options = response.data.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.start_time} - ${s.end_time})`,
            }))

            // Deduplicate by value
            const uniqueOptions = options.filter((option, index, self) =>
                index === self.findIndex((o) => o.value === option.value)
            )

            // Cache initial load
            if (search === '') {
                setCache('shifts', uniqueOptions)
            }

            return uniqueOptions
        } catch {
            return []
        }
    }, [getCache, setCache])

    // Load employees options with cache
    const loadEmployees = useCallback(async (search: string): Promise<SelectOption[]> => {
        // Only cache initial load (search == '')
        if (search === '') {
            const cached = getCache('employees')
            if (cached) {
                return cached
            }
        }

        try {
            const response = await schedulesApi.getEmployeesSelectOptions({q: search})
            const options = response.data.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.code})`,
            }))

            // Deduplicate by value
            const uniqueOptions = options.filter((option, index, self) =>
                index === self.findIndex((o) => o.value === option.value)
            )

            // Cache initial load
            if (search === '') {
                setCache('employees', uniqueOptions)
            }

            return uniqueOptions
        } catch {
            return []
        }
    }, [getCache, setCache])

    // Handle employee change
    const handleEmployeeChange = (value: number | string | null) => {
        const employeeId = value as number | undefined
        form.setValue('employee_id', employeeId)
        // Reset area and pos when employee changes
        form.setValue('area_id', undefined)
        form.setValue('pos_id', undefined)
    }

    // Handle area change
    const handleAreaChange = (value: number | string | null) => {
        const areaId = value as number | undefined
        form.setValue('area_id', areaId)
        // Reset pos when area changes
        form.setValue('pos_id', undefined)
    }

    const handleClose = () => {
        onOpenChange(false)
    }

    const onSubmit = async (values: ScheduleFormValues) => {
        if (!values.employee_id) {
            toast.error('Karyawan wajib dipilih')
            return
        }
        if (!values.date) {
            toast.error('Tanggal wajib diisi')
            return
        }

        try {
            if (mode === 'create') {
                await create({
                    employee_id: values.employee_id,
                    date: values.date,
                    shift_id: values.shift_id,
                    area_id: values.area_id,
                    pos_id: values.pos_id,
                })
                toast.success('Jadwal berhasil ditambahkan')
                handleClose()
            } else if (scheduleId) {
                await update(scheduleId, {
                    employee_id: values.employee_id,
                    date: values.date,
                    shift_id: values.shift_id,
                    area_id: values.area_id,
                    pos_id: values.pos_id,
                })
                toast.success('Jadwal berhasil diperbarui')
                handleClose()
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary"/>
                        {mode === 'create' ? 'Tambah Jadwal' : 'Edit Jadwal'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Employee */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground"/>
                            Karyawan *
                        </label>
                        <AsyncSelect
                            value={form.watch('employee_id') ?? null}
                            onChange={handleEmployeeChange}
                            loadOptions={loadEmployees}
                            placeholder="Pilih karyawan..."
                            isDisabled={isLoading}
                            readOnly={mode === 'edit' || (mode === 'create' && !!defaultEmployeeId)}
                            defaultOption={defaultEmployeeOption}
                            className="w-full"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tanggal *</label>
                        <Input
                            type="date"
                            {...form.register('date', {required: 'Tanggal wajib diisi'})}
                        />
                        {form.formState.errors.date && (
                            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                        )}
                    </div>

                    {/* Shift */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Shift</label>
                        <AsyncSelect
                            value={form.watch('shift_id') ?? null}
                            onChange={(value) => form.setValue('shift_id', value as number | undefined)}
                            loadOptions={loadShifts}
                            placeholder="Pilih shift (opsional)..."
                            isDisabled={isLoading}
                            defaultOption={defaultShiftOption}
                            className="w-full"
                        />
                    </div>

                    {/* Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Area (untuk rolling area)</label>
                        <AsyncSelect
                            value={form.watch('area_id') ?? null}
                            onChange={handleAreaChange}
                            loadOptions={async (search) => {
                                const employeeId = form.getValues('employee_id')
                                if (!employeeId) return []

                                // Cache key per employee
                                const cacheKey = `areas:${employeeId}`

                                // Only cache initial load
                                if (search === '') {
                                    const cached = getCache(cacheKey)
                                    if (cached) {
                                        return cached
                                    }
                                }

                                const response = await schedulesApi.getAreasSelectOptions({
                                    employee_id: employeeId,
                                    q: search
                                })
                                const options = response.data.map((a) => ({value: a.id, label: a.name}))

                                // Deduplicate by value
                                const uniqueOptions = options.filter((option, index, self) =>
                                    index === self.findIndex((o) => o.value === option.value)
                                )

                                // Cache initial load
                                if (search === '') {
                                    setCache(cacheKey, uniqueOptions)
                                }

                                return uniqueOptions
                            }}
                            placeholder={form.watch('employee_id') ? "Pilih area (opsional)..." : "Pilih karyawan terlebih dahulu..."}
                            isDisabled={isLoading || !form.watch('employee_id')}
                            className="w-full"
                        />
                    </div>

                    {/* POS */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">POS (lokasi absensi)</label>
                        <AsyncSelect
                            value={form.watch('pos_id') ?? null}
                            onChange={(value) => form.setValue('pos_id', value as number | undefined)}
                            loadOptions={async (search) => {
                                const areaId = form.getValues('area_id')
                                if (!areaId) return []

                                // Cache key per area
                                const cacheKey = `poss:${areaId}`

                                // Only cache initial load
                                if (search === '') {
                                    const cached = getCache(cacheKey)
                                    if (cached) {
                                        return cached
                                    }
                                }

                                const response = await schedulesApi.getPossSelectOptions({area_id: areaId, q: search})
                                const options = response.data.map((p) => ({value: p.id, label: p.name}))

                                // Deduplicate by value
                                const uniqueOptions = options.filter((option, index, self) =>
                                    index === self.findIndex((o) => o.value === option.value)
                                )

                                // Cache initial load
                                if (search === '') {
                                    setCache(cacheKey, uniqueOptions)
                                }

                                return uniqueOptions
                            }}
                            placeholder={form.watch('area_id') ? "Pilih POS (opsional)..." : "Pilih area terlebih dahulu..."}
                            isDisabled={isLoading || !form.watch('area_id')}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            POS menentukan lokasi absensi karyawan. Koordinat diambil dari data POS.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} className="px-6">
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isLoading} className="px-6">
                            <Save className="h-4 w-4 mr-2"/>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
