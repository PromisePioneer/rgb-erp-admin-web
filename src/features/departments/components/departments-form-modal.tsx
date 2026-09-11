/**
 * Departments Form Modal Component
 * Create and edit form using react-hook-form in a Dialog
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDepartmentsStore } from '../store/departments-store'

interface DepartmentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  departmentId?: number
}

const departmentFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter'),
  status: z.number(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

export function DepartmentsFormModal({
  open,
  onOpenChange,
  mode,
  departmentId,
}: DepartmentsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useDepartmentsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      status: 1,
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        status: 1,
      })
      hasShownValidationToast.current = false
    }
  }, [open, form])

  // Show toast on validation errors
  useEffect(() => {
    const errors = form.formState.errors
    const errorCount = Object.keys(errors).length

    if (
      errorCount > 0 &&
      form.formState.submitCount > 0 &&
      !hasShownValidationToast.current
    ) {
      hasShownValidationToast.current = true

      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .filter(Boolean) as string[]

      if (errorMessages.length === 1) {
        toast.error(errorMessages[0])
      } else if (errorMessages.length > 1) {
        toast.error(
          `${errorMessages.length} validation errors found. Please check the form.`
        )
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form, form.formState.errors, form.formState.submitCount])

  // Fetch data when editing
  useEffect(() => {
    if (mode === 'edit' && departmentId && open) {
      fetchById(departmentId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, departmentId, open, fetchById, resetForm])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (mode === 'create') {
        await create(values)
        toast.success('Department created successfully')
        handleClose()
      } else if (departmentId) {
        await update(departmentId, values)
        toast.success('Department updated successfully')
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
            <Building className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Department' : 'Edit Department'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Skeleton loading state when fetching for edit */}
          {mode === 'edit' && isLoading && !selectedItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          )}

          {/* Name */}
          {(mode === 'create' || selectedItem) && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              Nama *
            </label>
            <Input
              placeholder="Masukkan nama department"
              {...form.register('name')}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          )}

          {/* Status */}
          {(mode === 'create' || selectedItem) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Status *</label>
            <select
              {...form.register('status', { valueAsNumber: true })}
              value={form.watch('status')}
              onChange={(e) => form.setValue('status', Number(e.target.value))}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Tidak Aktif</option>
            </select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || (mode === 'edit' && !selectedItem)} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
