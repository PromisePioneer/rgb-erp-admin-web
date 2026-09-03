/**
 * Positions Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePositionsStore } from '@/features/positions'

interface PositionsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  positionId?: number
}

type PositionFormValues = {
  name: string
  status: number
  parent_position_id: number | null
}

export function PositionsFormModal({ open, onOpenChange, mode, positionId }: PositionsFormModalProps) {
  const {
    selectedItem,
    allPositions,
    isLoading,
    isSubmitting,
    fetchById,
    fetchParentPositions,
    create,
    update,
    resetForm,
  } = usePositionsStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<PositionFormValues>({
    defaultValues: {
      name: '',
      status: 1,
      parent_position_id: null,
    },
  })

  // Fetch parent positions (company_id = NULL only) when modal opens
  useEffect(() => {
    if (open) {
      fetchParentPositions()
    }
  }, [open, fetchParentPositions])

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        status: 1,
        parent_position_id: null,
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
    if (mode === 'edit' && positionId && open) {
      fetchById(positionId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, positionId, open, fetchById, resetForm])

  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        name: selectedItem.name,
        status: selectedItem.status,
        parent_position_id: selectedItem.parent_position_id,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: PositionFormValues) => {
    const payload = {
      name: values.name,
      status: values.status,
      parent_position_id: values.parent_position_id,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Position created successfully')
        handleClose()
      } else if (positionId) {
        await update(positionId, payload)
        toast.success('Position updated successfully')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Build hierarchical position options (all positions + include selected parent)
  const positionOptions = useMemo(() => {
    // Start with all positions
    let all = [...allPositions]

    // In edit mode, include the selected parent position if it exists but not in list
    if (mode === 'edit' && selectedItem?.parent_position_id) {
      const parentId = selectedItem.parent_position_id
      const hasParent = allPositions.some(p => p.id === parentId)
      if (!hasParent) {
        // Fetch parent from selectedItem data - create a temporary entry
        all.push({
          id: parentId,
          name: selectedItem.parent_position_name || 'Parent Position',
          company_id: null, // Assume universal for display
          status: 1,
          parent_position_id: null,
          parent_position_name: null,
          created_at: '',
          updated_at: '',
        })
      }
    }

    // Filter out current position (if editing)
    const filtered = all.filter(p => mode === 'edit' ? p.id !== positionId : true)

    // Build hierarchy levels
    const positionMap = new Map<number, typeof filtered[0] & { level: number }>()

    filtered.forEach(p => {
      positionMap.set(p.id, { ...p, level: 0 })
    })

    // Calculate levels
    filtered.forEach(p => {
      let level = 0
      let current = p
      while (current.parent_position_id) {
        level++
        const parent = filtered.find(ap => ap.id === current.parent_position_id)
        if (parent) {
          current = parent
        } else {
          break
        }
      }
      positionMap.set(p.id, { ...p, level })
    })

    // Sort by level then name
    return [...positionMap.values()].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return a.name.localeCompare(b.name)
    })
  }, [allPositions, mode, positionId, selectedItem])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Position' : 'Edit Position'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Position Name *
            </label>
            <Input
              placeholder="Masukkan nama jabatan"
              {...form.register('name', { required: 'Nama jabatan wajib diisi' })}
              className="h-11"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Parent Position (Hierarchy) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Parent Position (Atasan)
            </label>
            <p className="text-xs text-muted-foreground">
              Pilih posisi atasan. Kosongkan jika tidak punya atasan (top level).
            </p>
            <select
              {...form.register('parent_position_id', {
                setValueAs: (value) => value === '' ? null : Number(value)
              })}
              value={form.watch('parent_position_id') ?? ''}
              onChange={(e) => {
                const val = e.target.value
                form.setValue('parent_position_id', val === '' ? null : Number(val))
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Tidak Ada Atasan (Top Level) --</option>
              {positionOptions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {'  '.repeat(pos.level)}{pos.level > 0 ? '└─ ' : ''}{pos.name}
                </option>
              ))}
            </select>
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
