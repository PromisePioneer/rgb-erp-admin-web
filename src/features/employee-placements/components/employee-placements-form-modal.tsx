/**
 * Employee Placements Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Users, Building2 } from 'lucide-react'
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
import { useEmployeePlacementsStore } from '@/features/employee-placements'
import { employeePlacementsApi } from '@/features/employee-placements/api/employee-placements-api'

interface EmployeePlacementsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  placementId?: number
}

type PlacementFormValues = {
  employee_id?: number
  client_id?: number
  status: 'Aktif' | 'Tidak Aktif'
}

export function EmployeePlacementsFormModal({
  open,
  onOpenChange,
  mode,
  placementId,
}: EmployeePlacementsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useEmployeePlacementsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<PlacementFormValues>({
    defaultValues: {
      employee_id: undefined,
      client_id: undefined,
      status: 'Aktif',
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        employee_id: undefined,
        client_id: undefined,
        status: 'Aktif',
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

      if (errorMessages.length > 0) {
        toast.error(errorMessages[0])
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form, form.formState.errors, form.formState.submitCount])

  // Fetch data for edit mode
  useEffect(() => {
    if (mode === 'edit' && placementId && open) {
      fetchById(placementId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, placementId, open, fetchById, resetForm])

  // Populate form when data is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        employee_id: selectedItem.employee_id,
        client_id: selectedItem.client_id,
        status: selectedItem.status === 1 ? 'Aktif' : 'Tidak Aktif',
      })
    }
  }, [mode, selectedItem, open, form])

  const loadEmployees = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await employeePlacementsApi.getEmployeesSelectOptions({ q: search })
      return response.data.map((emp) => ({
        value: emp.id,
        label: emp.name,
      }))
    } catch {
      return []
    }
  }, [])

  const loadClients = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await employeePlacementsApi.getClientsSelectOptions({ q: search })
      return response.data.map((client) => ({
        value: client.id,
        label: client.name,
      }))
    } catch {
      return []
    }
  }, [])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: PlacementFormValues) => {
    if (!values.employee_id) {
      toast.error('Karyawan wajib dipilih')
      return
    }
    if (!values.client_id) {
      toast.error('Klien wajib dipilih')
      return
    }

    const payload = {
      employee_id: values.employee_id,
      client_id: values.client_id,
      status: values.status === 'Aktif' ? 1 : 0,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Penempatan karyawan berhasil ditambahkan')
        handleClose()
      } else if (placementId) {
        await update(placementId, payload)
        toast.success('Penempatan karyawan berhasil diperbarui')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Tambah Penempatan' : 'Edit Penempatan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee - disabled when editing */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Karyawan
            </label>
            {mode === 'edit' ? (
              <Input
                value={selectedItem?.employee_name ?? ''}
                disabled
                className="bg-muted"
              />
            ) : (
              <AsyncSelect
                value={form.watch('employee_id') ?? null}
                onChange={(value) =>
                  form.setValue('employee_id', value as number | undefined, { shouldValidate: true })
                }
                loadOptions={loadEmployees}
                placeholder="Pilih karyawan..."
                isDisabled={isLoading}
                className="w-full"
              />
            )}
            {mode === 'create' && (
              <p className="text-xs text-muted-foreground">
                Hanya karyawan yang belum ditempatkan akan ditampilkan.
              </p>
            )}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Klien
            </label>
            <AsyncSelect
              value={form.watch('client_id') ?? null}
              onChange={(value) =>
                form.setValue('client_id', value as number | undefined, { shouldValidate: true })
              }
              loadOptions={loadClients}
              placeholder="Pilih klien..."
              isDisabled={isLoading}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <AsyncSelect
              placeholder="Pilih status"
              loadOptions={async () => [
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Tidak Aktif', label: 'Tidak Aktif' },
              ]}
              value={form.watch('status')}
              onChange={(value) => form.setValue('status', value as 'Aktif' | 'Tidak Aktif')}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
