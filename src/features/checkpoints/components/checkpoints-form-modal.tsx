/**
 * Checkpoints Form Modal Component
 * Create and edit checkpoints in a modal dialog
 */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useCheckpointsStore } from '../store/checkpoints-store'
import type { Checkpoint } from '../types/checkpoints.types'
import { toast } from 'sonner'

const formSchema = z.object({
  area_id: z.number().min(1, 'Area is required'),
  name: z.string().min(1, 'Name is required'),
  lat: z.string().min(1, 'Latitude is required').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= -90 && num <= 90
  }, 'Latitude must be between -90 and 90'),
  lng: z.string().min(1, 'Longitude is required').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= -180 && num <= 180
  }, 'Longitude must be between -180 and 180'),
  radius_meters: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof formSchema>

interface CheckpointsFormModalProps {
  checkpoint?: Checkpoint | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckpointsFormModal({ checkpoint, open, onOpenChange }: CheckpointsFormModalProps) {
  const {
    selectedItem,
    areasOptions,
    fetchAreasOptions,
    fetchById,
    fetchNextSequence,
    regenerateSecret,
    create,
    update,
    isSubmitting,
    clearError,
  } = useCheckpointsStore()

  const [isRegeneratingSecret, setIsRegeneratingSecret] = useState(false)

  const isEdit = !!checkpoint

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area_id: 0,
      name: '',
      lat: '',
      lng: '',
      radius_meters: '100',
      status: 'active',
    },
  })

  // Fetch data on mount
  useEffect(() => {
    if (open) {
      fetchAreasOptions()
      clearError()

      if (checkpoint) {
        fetchById(checkpoint.id)
      }
    }
  }, [open, checkpoint, fetchById, fetchAreasOptions, clearError])

  // Populate form when selectedItem changes (for edit)
  useEffect(() => {
    if (selectedItem && isEdit) {
      form.reset({
        area_id: selectedItem.area_id,
        name: selectedItem.name,
        lat: selectedItem.lat?.toString() ?? '',
        lng: selectedItem.lng?.toString() ?? '',
        radius_meters: selectedItem.radius_meters?.toString() ?? '100',
        status: selectedItem.status,
      })
    }
  }, [selectedItem, isEdit, form])

  // Handle area change to get next sequence
  const handleAreaChange = async (areaId: string) => {
    const id = parseInt(areaId)
    form.setValue('area_id', id)

    if (!isEdit) {
      const sequence = await fetchNextSequence(id)
      toast.info(`Next sequence: ${sequence}`)
    }
  }

  const handleRegenerateSecret = async () => {
    if (!checkpoint) return
    setIsRegeneratingSecret(true)
    try {
      const newSecret = await regenerateSecret(checkpoint.id)
      if (newSecret) {
        toast.success('Secret key regenerated')
      } else {
        toast.error('Failed to regenerate secret')
      }
    } finally {
      setIsRegeneratingSecret(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        area_id: values.area_id,
        name: values.name,
        lat: parseFloat(values.lat),
        lng: parseFloat(values.lng),
        radius_meters: values.radius_meters ? parseInt(values.radius_meters) : 100,
        status: values.status,
      }

      if (isEdit && checkpoint) {
        await update(checkpoint.id, payload)
        toast.success('Checkpoint updated successfully')
      } else {
        await create(payload)
        toast.success('Checkpoint created successfully')
      }
      onOpenChange(false)
      form.reset()
    } catch {
      toast.error('Failed to save checkpoint')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Checkpoint' : 'Add Checkpoint'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Area */}
          <div className="space-y-2">
            <Label htmlFor="area_id">Area *</Label>
            <Select
              value={form.watch('area_id')?.toString() ?? ''}
              onValueChange={(value) => {
                if (value) {
                  handleAreaChange(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areasOptions.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.area_id && (
              <p className="text-sm text-destructive">{form.formState.errors.area_id.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter checkpoint name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude *</Label>
              <Input
                id="lat"
                placeholder="-6.2088"
                {...form.register('lat')}
              />
              {form.formState.errors.lat && (
                <p className="text-sm text-destructive">{form.formState.errors.lat.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude *</Label>
              <Input
                id="lng"
                placeholder="106.8456"
                {...form.register('lng')}
              />
              {form.formState.errors.lng && (
                <p className="text-sm text-destructive">{form.formState.errors.lng.message}</p>
              )}
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label htmlFor="radius_meters">Radius (meters)</Label>
            <Input
              id="radius_meters"
              type="number"
              min="1"
              max="1000"
              placeholder="100"
              {...form.register('radius_meters')}
            />
            {form.formState.errors.radius_meters && (
              <p className="text-sm text-destructive">{form.formState.errors.radius_meters.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secret Key (only for edit) */}
          {isEdit && selectedItem && (
            <div className="space-y-2">
              <Label>Secret Key (for OTP)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm truncate">
                  {selectedItem.secret_key || 'No secret key'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerateSecret}
                  disabled={isRegeneratingSecret}
                  title="Regenerate secret key"
                >
                  {isRegeneratingSecret ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedItem.has_secret_key
                  ? 'Checkpoint uses TOTP for verification'
                  : 'No secret key - checkpoint can be scanned without OTP'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
