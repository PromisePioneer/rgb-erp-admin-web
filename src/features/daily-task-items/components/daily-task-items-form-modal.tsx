/**
 * Daily Task Items Form Modal Component
 * Create and edit form with parent hierarchy selection
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption as AsyncSelectOption } from '@/components/async-select'
import { useDailyTaskItemsStore } from '../store/daily-task-items-store'
import { rolesApi } from '@/features/roles'
import { dailyTaskItemsApi } from '../api/daily-task-items-api'

interface DailyTaskItemsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  itemId?: number
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter'),
  description: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
  role_id: z.number().nullable().optional(),
  parent_item_id: z.number().nullable().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function DailyTaskItemsFormModal({
  open,
  onOpenChange,
  mode,
  itemId,
  onSuccess,
}: DailyTaskItemsFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetFilters,
  } = useDailyTaskItemsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      role_id: null,
      parent_item_id: null,
    },
  })

  const selectedParentId = form.watch('parent_item_id')

  // Load role options
  const loadRoleOptions = async (search: string): Promise<AsyncSelectOption[]> => {
    try {
      const response = await rolesApi.getSelectOptions()
      if (response.success) {
        // Filter locally based on search
        const filtered = search
          ? response.data.filter(role => role.name.toLowerCase().includes(search.toLowerCase()))
          : response.data
        return filtered.map((role) => ({
          value: role.id,
          label: role.name,
        }))
      }
      return []
    } catch {
      return []
    }
  }

  // Load parent options (roots only)
  const loadParentOptions = async (_search: string): Promise<AsyncSelectOption[]> => {
    try {
      const response = await dailyTaskItemsApi.getSelectOptions(true, mode === 'edit' ? itemId : undefined)
      if (response.success) {
        return response.data.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      }
      return []
    } catch {
      return []
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        description: '',
        status: 'active',
        role_id: null,
        parent_item_id: null,
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
        toast.error(`${errorMessages.length} validasi error. Periksa form.`)
      }
    }

    if (errorCount === 0) {
      hasShownValidationToast.current = false
    }
  }, [form.formState.errors, form.formState.submitCount])

  // Fetch data when editing
  useEffect(() => {
    if (mode === 'edit' && itemId && open) {
      fetchById(itemId)
    }
  }, [mode, itemId, open, fetchById])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        description: selectedItem.description || '',
        status: selectedItem.status,
        role_id: selectedItem.role_id,
        parent_item_id: selectedItem.parent_item_id,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        status: values.status,
        role_id: values.parent_item_id ? null : (values.role_id ?? null),
        parent_item_id: values.parent_item_id ?? null,
      }

      if (mode === 'create') {
        await create(payload)
        toast.success('Item berhasil ditambahkan')
        resetFilters()
        handleClose()
        onSuccess?.()
      } else if (itemId) {
        await update(itemId, payload)
        toast.success('Item berhasil diperbarui')
        handleClose()
        onSuccess?.()
      } else {
        toast.error('ID item tidak ditemukan')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Tambah Item Tugas Harian' : 'Edit Item Tugas Harian'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Nama *
            </label>
            <Input
              placeholder="Masukkan nama item"
              {...form.register('name')}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Parent Item Selection */}
          <AsyncSelect
            label="Parent / Group"
            value={form.watch('parent_item_id')}
            onChange={(value) => form.setValue('parent_item_id', value as number | null)}
            loadOptions={loadParentOptions}
            placeholder="Pilih Parent (Kosongkan untuk Root)"
            isDisabled={isSubmitting || isLoading}
          />

          {/* Role - only show if no parent selected */}
          {!selectedParentId && (
            <AsyncSelect
              label="Role"
              value={form.watch('role_id')}
              onChange={(value) => form.setValue('role_id', value as number | null)}
              loadOptions={loadRoleOptions}
              placeholder="Pilih Role (Opsional)"
              isDisabled={isSubmitting || isLoading}
            />
          )}

          {selectedParentId && (
            <p className="text-xs text-muted-foreground -mt-2">
              Child item tidak bisa punya role sendiri, akan mengikuti parent
            </p>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              {...form.register('description')}
              placeholder="Masukkan deskripsi (opsional)"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
              rows={3}
            />
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
