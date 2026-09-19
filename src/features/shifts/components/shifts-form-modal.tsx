/**
 * Shifts Form Modal Component
 * Create and edit form using react-hook-form
 *
 * Flow:
 * 1. Select Client (required) - async search
 * 2. Select Area (required) - filtered by selected client
 * 3. Auto-select Area if client has only 1 area
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Save, Clock, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useShiftsStore } from '@/features/shifts'
import { areasApi } from '@/features/areas'
import { clientsApi } from '@/features/clients'

interface ShiftsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  shiftId?: number
}

type ShiftFormValues = {
  code: string
  name: string
  start_time: string
  end_time: string
  status: number
  client_id: number | null
  area_id: number | null
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
  const [isLoadingAreas, setIsLoadingAreas] = useState(false)

  const form = useForm<ShiftFormValues>({
    defaultValues: {
      code: '',
      name: '',
      start_time: '',
      end_time: '',
      status: 1,
      client_id: null,
      area_id: null,
    },
  })

  // Watch client_id to trigger area loading
  const selectedClientId = form.watch('client_id')
  const selectedAreaId = form.watch('area_id')

  // Reset area when client changes
  useEffect(() => {
    if (mode === 'create') {
      form.setValue('area_id', null)
    }
  }, [selectedClientId, mode, form])

  useEffect(() => {
    if (!open) {
      form.reset({
        code: '',
        name: '',
        start_time: '',
        end_time: '',
        status: 1,
        client_id: null,
        area_id: null,
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
        code: selectedItem.code ?? '',
        name: selectedItem.name,
        start_time: selectedItem.start_time ?? '',
        end_time: selectedItem.end_time ?? '',
        status: selectedItem.status,
        client_id: selectedItem.client_id,
        area_id: selectedItem.area_id,
      })
    }
  }, [mode, selectedItem, open, form])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: ShiftFormValues) => {
    // Validate client_id and area_id
    if (!values.client_id) {
      toast.error('Client wajib dipilih')
      return
    }
    if (!values.area_id) {
      toast.error('Area wajib dipilih')
      return
    }

    const payload = {
      code: values.code,
      name: values.name,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      status: values.status,
      client_id: values.client_id,
      area_id: values.area_id,
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

  // Load client options for async select
  const loadClientOptions = async (search: string): Promise<SelectOption[]> => {
    const result = await clientsApi.getSelectOptions({ q: search })
    return result.data.map((client) => ({
      value: client.id,
      label: client.name,
    }))
  }

  // Load area options filtered by selected client
  const loadAreaOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
    if (!selectedClientId) {
      return []
    }

    setIsLoadingAreas(true)
    try {
      const result = await areasApi.getSelectOptions({
        client_id: selectedClientId,
        q: search,
      })
      return result.data.map((area) => ({
        value: area.id,
        label: area.name,
      }))
    } catch (error) {
      console.error('Failed to load areas:', error)
      return []
    } finally {
      setIsLoadingAreas(false)
    }
  }, [selectedClientId])

  // Auto-select area if client has only 1 area
  const checkAndAutoSelectArea = useCallback(async () => {
    if (!selectedClientId || mode !== 'create') return

    try {
      const result = await areasApi.getSelectOptions({
        client_id: selectedClientId,
        q: '',
      })

      // If only 1 area, auto-select it
      if (result.data.length === 1) {
        const singleArea = result.data[0]
        form.setValue('area_id', singleArea.id, { shouldValidate: true })
        toast.info(`Area "${singleArea.name}" auto-selected (hanya 1 area untuk client ini)`)
      }
    } catch (error) {
      console.error('Failed to check auto-select area:', error)
    }
  }, [selectedClientId, mode, form])

  // Trigger auto-select when client changes
  useEffect(() => {
    if (selectedClientId && mode === 'create') {
      // Small delay to ensure form state is updated
      const timer = setTimeout(() => {
        checkAndAutoSelectArea()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedClientId, checkAndAutoSelectArea, mode])

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
          {/* Client - Async Select (Required) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Client *
            </label>
            <Controller
              name="client_id"
              control={form.control}
              rules={{ required: 'Client wajib dipilih' }}
              render={({ field, fieldState }) => (
                <>
                  <AsyncSelect
                    placeholder="Pilih Client..."
                    value={field.value}
                    onChange={(val) => field.onChange(val as number | null)}
                    loadOptions={loadClientOptions}
                    className="w-full"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Pilih client terlebih dahulu
            </p>
          </div>

          {/* Area - Async Select (Required, filtered by client) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Area *</label>
            <Controller
              name="area_id"
              control={form.control}
              rules={{ required: 'Area wajib dipilih' }}
              render={({ field, fieldState }) => (
                <>
                  <AsyncSelect
                    placeholder={
                      !selectedClientId
                        ? 'Pilih Client dulu...'
                        : isLoadingAreas
                        ? 'Memuat area...'
                        : 'Pilih Area...'
                    }
                    value={field.value}
                    onChange={(val) => field.onChange(val as number | null)}
                    loadOptions={loadAreaOptions}
                    isDisabled={!selectedClientId}
                    className="w-full"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
            {selectedClientId && !selectedAreaId && !isLoadingAreas && (
              <p className="text-xs text-muted-foreground">
                Area akan auto-pilih jika client hanya punya 1 area
              </p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Code *
            </label>
            <Input
              placeholder="Contoh: P, S, M"
              {...form.register('code', { required: 'Code wajib diisi' })}
              className="h-11"
            />
            {form.formState.errors.code && (
              <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Kode unik per area (tidak boleh sama)
            </p>
          </div>

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
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                {...form.register('end_time')}
                className="h-11"
              />
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
