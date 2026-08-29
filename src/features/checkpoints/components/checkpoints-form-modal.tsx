/**
 * Checkpoints Form Modal Component
 * Create and edit checkpoints in a modal dialog
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
  project_id: z.number().min(1, 'Project is required'),
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
    projectsOptions,
    fetchProjectsOptions,
    fetchById,
    fetchNextSequence,
    create,
    update,
    isSubmitting,
    clearError,
  } = useCheckpointsStore()

  const isEdit = !!checkpoint

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: 0,
      name: '',
      lat: '',
      lng: '',
      radius_meters: '50',
      status: 'active',
    },
  })

  // Fetch data on mount
  useEffect(() => {
    if (open) {
      fetchProjectsOptions()
      clearError()

      if (checkpoint) {
        fetchById(checkpoint.id)
      }
    }
  }, [open, checkpoint, fetchById, fetchProjectsOptions, clearError])

  // Populate form when selectedItem changes (for edit)
  useEffect(() => {
    if (selectedItem && isEdit) {
      form.reset({
        project_id: selectedItem.project_id,
        name: selectedItem.name,
        lat: selectedItem.lat?.toString() ?? '',
        lng: selectedItem.lng?.toString() ?? '',
        radius_meters: selectedItem.radius_meters?.toString() ?? '50',
        status: selectedItem.status,
      })
    }
  }, [selectedItem, isEdit, form])

  // Handle project change to get next sequence
  const handleProjectChange = async (projectId: string) => {
    const id = parseInt(projectId)
    form.setValue('project_id', id)

    if (!isEdit) {
      const sequence = await fetchNextSequence(id)
      toast.info(`Next sequence: ${sequence}`)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        project_id: values.project_id,
        name: values.name,
        lat: parseFloat(values.lat),
        lng: parseFloat(values.lng),
        radius_meters: values.radius_meters ? parseInt(values.radius_meters) : 50,
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
          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select
              value={form.watch('project_id')?.toString() ?? ''}
              onValueChange={(value) => {
                if (value) {
                  handleProjectChange(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projectsOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.project_id && (
              <p className="text-sm text-destructive">{form.formState.errors.project_id.message}</p>
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
              placeholder="50"
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
