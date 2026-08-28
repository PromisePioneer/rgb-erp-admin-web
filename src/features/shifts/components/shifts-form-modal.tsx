/**
 * Shifts Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useShiftsStore } from '@/features/shifts'

interface ShiftsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  shiftId?: number
}

type ShiftFormValues = {
  name: string
  start_time: string
  end_time: string
  status: number
}

export function ShiftsFormModal({ open, onOpenChange, mode, shiftId }: ShiftsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useShiftsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<ShiftFormValues>({
    defaultValues: {
      name: '',
      start_time: '',
      end_time: '',
      status: 1,
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        start_time: '',
        end_time: '',
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
    if (mode === 'edit' && shiftId && open) {
      fetchById(shiftId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, shiftId, open, fetchById, resetForm])

  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        start_time: selectedItem.start_time ?? '',
        end_time: selectedItem.end_time ?? '',
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: ShiftFormValues) => {
    const payload = {
      name: values.name,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      status: values.status,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Shift created successfully')
        handleClose()
      } else if (shiftId) {
        await update(shiftId, payload)
        toast.success('Shift updated successfully')
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
            <Clock className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Shift' : 'Edit Shift'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Shift Name *
            </label>
            <Input
              placeholder="Contoh: Pagi, Siang, Malam"
              {...form.register('name', { required: 'Nama shift wajib diisi' })}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                {...form.register('start_time')}
                className="h-11"
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-500">{form.formState.errors.start_time.message}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                {...form.register('end_time')}
                className="h-11"
              />
              {form.formState.errors.end_time && (
                <p className="text-sm text-red-500">{form.formState.errors.end_time.message}</p>
              )}
            </div>
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
