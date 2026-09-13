/**
 * Salary Components Form Modal Component
 * Create and edit form using react-hook-form with async select for client and role
 */
import { useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Coins, Building2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSalaryComponentsStore } from '@/features/salary-components'
import { useRolesStore } from '@/features/roles/store/roles-store'
import { clientsApi } from '@/features/clients/api/clients-api'
import { rolesApi } from '@/features/roles/api/roles-api'

interface SalaryComponentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  salaryComponentId?: number
}

type SalaryComponentFormValues = {
  client_id: number
  role_id: number | null
  name: string
  type: 'earning' | 'deduction'
  value: string
  status: number
}

export function SalaryComponentsFormModal({
  open,
  onOpenChange,
  mode,
  salaryComponentId
}: SalaryComponentsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useSalaryComponentsStore()

  const { fetchAllRoles } = useRolesStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<SalaryComponentFormValues>({
    defaultValues: {
      client_id: 0,
      role_id: null,
      name: '',
      type: 'earning',
      value: '',
      status: 1,
    },
  })

  // Fetch roles on mount
  useEffect(() => {
    fetchAllRoles()
  }, [fetchAllRoles])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        client_id: 0,
        role_id: null,
        name: '',
        type: 'earning',
        value: '',
        status: 1,
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

  // Fetch item data for edit mode
  useEffect(() => {
    if (mode === 'edit' && salaryComponentId && open) {
      fetchById(salaryComponentId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, salaryComponentId, open, fetchById, resetForm])

  // Populate form when selectedItem is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        client_id: selectedItem.client_id ?? 0,
        role_id: selectedItem.role_id ?? null,
        name: selectedItem.name,
        type: selectedItem.type,
        value: selectedItem.value !== null ? String(selectedItem.value) : '',
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  // Load client options for AsyncSelect
  const loadClientOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await clientsApi.getSelectOptions({ q: search })
      return response.data.map((client) => ({
        value: client.id,
        label: client.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Load role options for AsyncSelect
  const loadRoleOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await rolesApi.getSelectOptions({ q: search })
      return response.data.map((role) => ({
        value: role.id,
        label: role.name,
      }))
    } catch {
      return []
    }
  }, [])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: SalaryComponentFormValues) => {
    const payload = {
      client_id: values.client_id,
      role_id: values.role_id || null,
      name: values.name,
      type: values.type,
      value: values.value ? parseFloat(values.value) : null,
      status: values.status,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Salary component created successfully')
        handleClose()
      } else if (salaryComponentId) {
        await update(salaryComponentId, payload)
        toast.success('Salary component updated successfully')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Salary Component' : 'Edit Salary Component'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Client - AsyncSelect */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Client *
            </label>
            <AsyncSelect
              value={form.watch('client_id') || null}
              onChange={(value) => {
                form.setValue('client_id', value ? Number(value) : 0, { shouldValidate: true })
              }}
              loadOptions={loadClientOptions}
              placeholder="Pilih Client..."
              label=""
              defaultOptions={true}
              error={form.formState.errors.client_id?.message}
            />
            <p className="text-xs text-muted-foreground">
              Pilih client untuk komponen ini. Kosongkan role di bawah untuk apply ke semua role.
            </p>
          </div>

          {/* Role - AsyncSelect (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Role / Jabatan
              <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
            </label>
            <AsyncSelect
              value={form.watch('role_id') || null}
              onChange={(value) => {
                form.setValue('role_id', value ? Number(value) : null)
              }}
              loadOptions={loadRoleOptions}
              placeholder="Semua Role (Apply to all)..."
              label=""
              defaultOptions={true}
            />
            <p className="text-xs text-muted-foreground">
              Pilih role tertentu untuk tunjangan jabatan. Kosongkan untuk apply ke semua role.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              Component Name *
            </label>
            <Input
              placeholder="Contoh: Tunjangan Makan, Potongan BPJS"
              {...form.register('name', { required: 'Nama komponen gaji wajib diisi' })}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <select
              {...form.register('type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="earning">Earning (Penambahan)</option>
              <option value="deduction">Deduction (Potongan)</option>
            </select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
            )}
          </div>

          {/* Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              Value
              <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
            </label>
            <Input
              type="number"
              step="any"
              placeholder="Contoh: 150000 (kosongkan jika case-by-case)"
              {...form.register('value')}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika nilainya berbeda per karyawan (case-by-case).
            </p>
            {form.formState.errors.value && (
              <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              {...form.register('status', { valueAsNumber: true })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
            )}
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
