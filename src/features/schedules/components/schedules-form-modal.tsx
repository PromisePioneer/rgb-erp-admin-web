/**
 * Schedules Form Modal Component
 * Create and edit form using react-hook-form with cascading dropdowns
 */
import { useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useSchedulesStore } from '../store/schedules-store'
import { schedulesApi } from '../api/schedules-api'

interface SchedulesFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  scheduleId?: number
}

type ScheduleFormValues = {
  employee_id: number | undefined
  date: string
  shift_id: number | undefined
  area_id: number | undefined
  pos_id: number | undefined
}

export function SchedulesFormModal({ open, onOpenChange, mode, scheduleId }: SchedulesFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useSchedulesStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<ScheduleFormValues>({
    defaultValues: {
      employee_id: undefined,
      date: new Date().toISOString().split('T')[0],
      shift_id: undefined,
      area_id: undefined,
      pos_id: undefined,
    },
  })

  // Reset form when modal closes
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
    }
  }, [open, form])

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

  // Fetch data for edit mode
  useEffect(() => {
    if (mode === 'edit' && scheduleId && open) {
      fetchById(scheduleId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, scheduleId, open, fetchById, resetForm])

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

  // Load shifts options
  const loadShifts = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await schedulesApi.getShiftsSelectOptions({ q: search })
      return response.data.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.start_time} - ${s.end_time})`,
      }))
    } catch {
      return []
    }
  }, [])

  // Load employees options
  const loadEmployees = useCallback(async (search: string) => {
    try {
      const response = await schedulesApi.getEmployeesSelectOptions({ q: search })
      return response.data.map((e) => ({
        value: e.id,
        label: `${e.name} (${e.code})`,
      }))
    } catch {
      return []
    }
  }, [])

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
            <Calendar className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Employee */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Karyawan *
            </label>
            <AsyncSelect
              value={form.watch('employee_id') ?? null}
              onChange={handleEmployeeChange}
              loadOptions={loadEmployees}
              placeholder="Pilih karyawan..."
              isDisabled={isLoading || mode === 'edit'}
              className="w-full"
            />
            {form.formState.errors.employee_id && (
              <p className="text-sm text-red-500">{form.formState.errors.employee_id.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal *</label>
            <Input
              type="date"
              {...form.register('date', { required: 'Tanggal wajib diisi' })}
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
                const response = await schedulesApi.getAreasSelectOptions({ employee_id: employeeId, q: search })
                return response.data.map((a) => ({ value: a.id, label: a.name }))
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
                const response = await schedulesApi.getPossSelectOptions({ area_id: areaId, q: search })
                return response.data.map((p) => ({ value: p.id, label: p.name }))
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
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
