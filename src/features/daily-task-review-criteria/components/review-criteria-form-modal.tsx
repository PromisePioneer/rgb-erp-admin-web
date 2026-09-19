/**
 * Daily Task Review Criteria Form Modal Component
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReviewCriteriaStore } from '../store/review-criteria-store'

interface ReviewCriteriaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  criteriaId?: number
}

const reviewCriteriaFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter'),
  order: z.number().min(0, 'Urutan minimal 0'),
  status: z.enum(['active', 'inactive']),
})

type ReviewCriteriaFormValues = z.infer<typeof reviewCriteriaFormSchema>

export function ReviewCriteriaFormModal({
  open,
  onOpenChange,
  mode,
  criteriaId,
}: ReviewCriteriaFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useReviewCriteriaStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<ReviewCriteriaFormValues>({
    resolver: zodResolver(reviewCriteriaFormSchema),
    defaultValues: {
      name: '',
      order: 0,
      status: 'active',
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        order: 0,
        status: 'active',
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
  }, [form.formState.errors, form.formState.submitCount])

  // Fetch data when editing
  useEffect(() => {
    if (mode === 'edit' && criteriaId && open) {
      fetchById(criteriaId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, criteriaId, open, fetchById, resetForm])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        order: selectedItem.order,
        status: selectedItem.status,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: ReviewCriteriaFormValues) => {
    try {
      if (mode === 'create') {
        await create(values)
        toast.success('Review Criteria created successfully')
        handleClose()
      } else if (criteriaId) {
        await update(criteriaId, values)
        toast.success('Review Criteria updated successfully')
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
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add Review Criteria' : 'Edit Review Criteria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Nama Criteria *
            </label>
            <Input
              placeholder="Masukkan nama criteria"
              {...form.register('name')}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Urutan *
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Nomor urut untuk menampilkan criteria (0 = pertama)
            </p>
            <Input
              type="number"
              min="0"
              placeholder="0"
              {...form.register('order', { valueAsNumber: true })}
              className="h-11"
            />
            {form.formState.errors.order && (
              <p className="text-sm text-red-500">
                {form.formState.errors.order.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status *</label>
            <select
              {...form.register('status')}
              value={form.watch('status')}
              onChange={(e) => form.setValue('status', e.target.value as 'active' | 'inactive')}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

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
