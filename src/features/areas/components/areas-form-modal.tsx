/**
 * Areas Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { MapPicker } from '@/components/map-picker'
import { useAreasStore } from '@/features/areas'
import { clientsApi } from '@/features/clients/api/clients-api'

interface AreasFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  areaId?: number
  defaultClientId?: number
  defaultClientName?: string
}

type AreaFormValues = {
  client_id?: number
  name: string
  latitude: string
  longitude: string
  description: string
  status: 'Aktif' | 'Tidak Aktif'
  coordinator_id?: number | null
}

const STATUS_OPTIONS = [
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Tidak Aktif', label: 'Tidak Aktif' },
]

export function AreasFormModal({
  open,
  onOpenChange,
  mode,
  areaId,
  defaultClientId,
  defaultClientName,
}: AreasFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useAreasStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<AreaFormValues>({
    defaultValues: {
      client_id: defaultClientId,
      name: '',
      latitude: '',
      longitude: '',
      description: '',
      status: 'Aktif',
      coordinator_id: null,
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        client_id: defaultClientId,
        name: '',
        latitude: '',
        longitude: '',
        description: '',
        status: 'Aktif',
        coordinator_id: null,
      })
      hasShownValidationToast.current = false
    }
  }, [open, form, defaultClientId])

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
  }, [form.formState.errors, form.formState.submitCount])

  // Fetch data for edit mode
  useEffect(() => {
    if (mode === 'edit' && areaId && open) {
      fetchById(areaId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, areaId, open, fetchById, resetForm])

  // Populate form when data is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        client_id: selectedItem.client_id,
        name: selectedItem.name,
        latitude: selectedItem.latitude ?? '',
        longitude: selectedItem.longitude ?? '',
        description: selectedItem.description ?? '',
        status: selectedItem.status === 1 ? 'Aktif' : 'Tidak Aktif',
        coordinator_id: selectedItem.coordinator_id ?? null,
      })
    }
  }, [mode, selectedItem, open, form])

  const loadClients = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await clientsApi.getList({ search, per_page: 20 })
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

  const onSubmit = async (values: AreaFormValues) => {
    if (!values.client_id) {
      toast.error('Client wajib dipilih')
      return
    }
    if (!values.name.trim()) {
      toast.error('Nama area wajib diisi')
      return
    }

    const payload = {
      client_id: values.client_id,
      name: values.name.trim(),
      latitude: values.latitude.trim() || undefined,
      longitude: values.longitude.trim() || undefined,
      description: values.description.trim() || undefined,
      status: values.status,
      coordinator_id: values.coordinator_id ?? null,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Area berhasil ditambahkan')
        handleClose()
      } else if (areaId) {
        await update(areaId, payload)
        toast.success('Area berhasil diperbarui')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  const isClientLocked = mode === 'edit' || !!defaultClientId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Tambah Area' : 'Edit Area'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Client
            </label>
            {isClientLocked ? (
              <Input
                value={selectedItem?.client_name ?? defaultClientName ?? ''}
                disabled
                className="bg-muted"
              />
            ) : (
              <AsyncSelect
                value={form.watch('client_id') ?? null}
                onChange={(val) => form.setValue('client_id', val as number | undefined, { shouldValidate: true })}
                loadOptions={loadClients}
                placeholder="Pilih client..."
                isDisabled={isLoading}
                className="w-full"
              />
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Nama Area
            </label>
            <Input
              placeholder="Contoh: gedung A, Perimeter, Lobby"
              {...form.register('name', { required: 'Nama area wajib diisi' })}
            />
          </div>

          {/* Coordinates Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                placeholder="-6.2088"
                {...form.register('latitude')}
                onChange={(e) => {
                  form.setValue('latitude', e.target.value, { shouldValidate: false })
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                placeholder="106.8456"
                {...form.register('longitude')}
                onChange={(e) => {
                  form.setValue('longitude', e.target.value, { shouldValidate: false })
                }}
              />
            </div>
          </div>

          {/* Map Picker */}
          <MapPicker
            lat={form.watch('latitude')}
            lng={form.watch('longitude')}
            onChange={(lat, lng) => {
              form.setValue('latitude', lat ?? '', { shouldValidate: false })
              form.setValue('longitude', lng ?? '', { shouldValidate: false })
            }}
            label="Pilih Lokasi di Peta"
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              placeholder="Deskripsi area..."
              {...form.register('description')}
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-transparent"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <AsyncSelect
              placeholder="Pilih status..."
              loadOptions={async () => STATUS_OPTIONS}
              value={form.watch('status')}
              onChange={(val) => form.setValue('status', val as 'Aktif' | 'Tidak Aktif')}
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
