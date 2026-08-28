/**
 * Poss Form Modal Component
 * Create and edit form using react-hook-form
 */
import { useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { MapPicker } from '@/components/map-picker'
import { usePossStore } from '@/features/poss'
import { areasApi } from '@/features/areas/api/areas-api'

interface PossFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  posId?: number
  defaultAreaId?: number
  defaultClientId?: number
}

type PosFormValues = {
  area_id?: number
  name: string
  description: string
  latitude: string
  longitude: string
  status: 'Aktif' | 'Tidak Aktif'
}

export function PossFormModal({
  open,
  onOpenChange,
  mode,
  posId,
  defaultAreaId,
  defaultClientId,
}: PossFormModalProps) {
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = usePossStore()

  const hasShownValidationToast = useRef(false)

  const form = useForm<PosFormValues>({
    defaultValues: {
      area_id: defaultAreaId,
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      status: 'Aktif',
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        area_id: defaultAreaId,
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        status: 'Aktif',
      })
      hasShownValidationToast.current = false
    }
  }, [open, form, defaultAreaId])

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
  }, [form, form.formState.errors, form.formState.submitCount])

  // Fetch data for edit mode
  useEffect(() => {
    if (mode === 'edit' && posId && open) {
      fetchById(posId)
    }
    if (mode === 'create' && open) {
      resetForm()
    }
  }, [mode, posId, open, fetchById, resetForm])

  // Populate form when data is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem && open) {
      form.reset({
        area_id: selectedItem.area_id,
        name: selectedItem.name,
        description: selectedItem.description ?? '',
        latitude: selectedItem.latitude ?? '',
        longitude: selectedItem.longitude ?? '',
        status: selectedItem.status === 1 ? 'Aktif' : 'Tidak Aktif',
      })
    }
  }, [mode, selectedItem, open, form])

  const loadAreas = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const params: { q?: string; client_id?: number } = { q: search }
      if (defaultClientId) params.client_id = defaultClientId
      const response = await areasApi.getList(params)
      return response.data.map((area) => ({
        value: area.id,
        label: area.name,
      }))
    } catch {
      return []
    }
  }, [defaultClientId])

  const handleClose = () => {
    onOpenChange(false)
  }

  const onSubmit = async (values: PosFormValues) => {
    if (!values.area_id) {
      toast.error('Area wajib dipilih')
      return
    }
    if (!values.name.trim()) {
      toast.error('Nama pos wajib diisi')
      return
    }

    const payload = {
      area_id: values.area_id,
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      latitude: values.latitude.trim() || undefined,
      longitude: values.longitude.trim() || undefined,
      status: values.status,
    }

    try {
      if (mode === 'create') {
        await create(payload)
        toast.success('Pos berhasil ditambahkan')
        handleClose()
      } else if (posId) {
        await update(posId, payload)
        toast.success('Pos berhasil diperbarui')
        handleClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  const isAreaLocked = mode === 'edit' || !!defaultAreaId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Tambah Pos' : 'Edit Pos'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Area
            </label>
            {isAreaLocked ? (
              <Input
                value={selectedItem?.area_name ?? ''}
                disabled
                className="bg-muted"
              />
            ) : (
              <AsyncSelect
                value={form.watch('area_id') ?? null}
                onChange={(value) =>
                  form.setValue('area_id', value as number | undefined, { shouldValidate: true })
                }
                loadOptions={loadAreas}
                placeholder="Pilih area..."
                isDisabled={isLoading}
                className="w-full"
              />
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Nama Pos
            </label>
            <Input
              placeholder="Contoh: Pos utama, Lobby, Parkir"
              {...form.register('name', { required: 'Nama pos wajib diisi' })}
            />
          </div>

          {/* Coordinates Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                placeholder="-6.9000"
                {...form.register('latitude')}
                onChange={(e) => {
                  form.setValue('latitude', e.target.value, { shouldValidate: false })
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                placeholder="107.6100"
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
              placeholder="Deskripsi pos..."
              {...form.register('description')}
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-transparent"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'Aktif' | 'Tidak Aktif')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
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
