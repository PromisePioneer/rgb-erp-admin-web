/**
 * Roles Form Modal Component
 * Create and edit form with parent hierarchy selection
 */
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRolesStore } from '../store/roles-store'

interface RolesFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  roleId?: number
}

const roleFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter'),
  status: z.number(),
  parent_role_id: z.number().nullable().optional(),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

export function RolesFormModal({
  open,
  onOpenChange,
  mode,
  roleId,
}: RolesFormModalProps) {
  const {
    selectedItem,
    allRoles, // Get all roles for parent selection
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useRolesStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      status: 1,
      parent_role_id: null,
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        status: 1,
        parent_role_id: null,
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
    if (mode === 'edit' && roleId && open) {
      fetchById(roleId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, roleId, open, fetchById, resetForm])

  // Populate form when selectedItem loads
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        status: selectedItem.status,
        parent_role_id: selectedItem.parent_role_id,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: RoleFormValues) => {
    try {
      const payload = {
        name: values.name,
        status: values.status,
        parent_role_id: values.parent_role_id,
      }

      if (mode === 'create') {
        await create(payload)
        toast.success('Role created successfully')
        handleClose()
      } else if (roleId) {
        await update(roleId, payload)
        toast.success('Role updated successfully')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Get roles for parent dropdown (exclude current role to avoid self-reference)
  const parentRoles = allRoles.filter(r => mode === 'create' || r.id !== roleId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Role' : 'Edit Role'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Nama *
            </label>
            <Input
              placeholder="Masukkan nama role"
              {...form.register('name')}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Parent Role (Approver) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Atasan (Approver) *
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Pilih role yang akan menyetujui request dari role ini. Kosongkan jika tidak butuh approval.
            </p>
            <select
              {...form.register('parent_role_id', { valueAsNumber: true })}
              value={form.watch('parent_role_id') ?? ''}
              onChange={(e) => {
                const val = e.target.value
                form.setValue('parent_role_id', val ? Number(val) : null)
              }}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="">-- Tidak Ada Approver (Auto Approve) --</option>
              {parentRoles.length > 0 ? (
                parentRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  Tidak ada role tersedia
                </option>
              )}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status *</label>
            <select
              {...form.register('status', { valueAsNumber: true })}
              value={form.watch('status')}
              onChange={(e) => form.setValue('status', Number(e.target.value))}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Tidak Aktif</option>
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
