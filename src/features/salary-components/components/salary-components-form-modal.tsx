/**
 * Salary Components Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSalaryComponentsStore } from '@/features/salary-components'

interface SalaryComponentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  salaryComponentId?: number
}

type SalaryComponentFormValues = {
  name: string
  type: 'earning' | 'deduction'
  value: string
  status: number
}

export function SalaryComponentsFormModal({ open, onOpenChange, mode, salaryComponentId }: SalaryComponentsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useSalaryComponentsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<SalaryComponentFormValues>({
    defaultValues: {
      name: '',
      type: 'earning',
      value: '',
      status: 1,
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        type: 'earning',
        value: '',
        status: 1,
      })
      hasShownValidationToast.current = false
    }
  }, [open, form])

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

  useEffect(() => {
    if (mode === 'edit' && salaryComponentId && open) {
      fetchById(salaryComponentId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, salaryComponentId, open, fetchById, resetForm])

  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        type: selectedItem.type,
        value: String(selectedItem.value),
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: SalaryComponentFormValues) => {
    const payload = {
      name: values.name,
      type: values.type,
      value: parseFloat(values.value) || 0,
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
              Value *
            </label>
            <Input
              type="number"
              step="any"
              placeholder="Contoh: 150000"
              {...form.register('value', {
                required: 'Nilai wajib diisi',
                min: { value: 0, message: 'Nilai harus positif' }
              })}
              className="h-11"
            />
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
