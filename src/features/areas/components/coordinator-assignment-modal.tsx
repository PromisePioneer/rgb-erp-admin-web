/**
 * Coordinator Assignment Modal Component
 * Assign area coordinator from the areas table
 */
import { useEffect, useCallback, useState } from 'react'
import { User, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { areasApi } from '@/features/areas/api/areas-api'
import type { Area } from '@/features/areas/types/areas.types'

interface CoordinatorAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  area: Area | null
  onSuccess: () => void
}

export function CoordinatorAssignmentModal({
  open,
  onOpenChange,
  area,
  onSuccess,
}: CoordinatorAssignmentModalProps) {
  const [coordinatorId, setCoordinatorId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset when modal opens/closes or area changes
  useEffect(() => {
    if (open && area) {
      setCoordinatorId(area.coordinator_id ?? null)
    }
    if (!open) {
      setCoordinatorId(null)
    }
  }, [open, area])

  const loadCoordinators = useCallback(
    async (search: string): Promise<SelectOption[]> => {
      if (!area) return []

      try {
        const params: { area_id: number; q?: string } = { area_id: area.id }
        if (search) params.q = search

        const response = await areasApi.getCoordinatorOptions(params)
        return response.data.map((coordinator) => ({
          value: coordinator.id,
          label: coordinator.text,
        }))
      } catch {
        return []
      }
    },
    [area]
  )

  const handleSubmit = async () => {
    if (!area) return

    setIsSubmitting(true)
    try {
      await areasApi.update(area.id, {
        client_id: area.client_id,
        name: area.name,
        status: area.status === 1 ? 'Aktif' : 'Tidak Aktif',
        coordinator_id: coordinatorId,
      })
      toast.success('Coordinator berhasil diassign')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!area) return

    setIsSubmitting(true)
    try {
      await areasApi.update(area.id, {
        client_id: area.client_id,
        name: area.name,
        status: area.status === 1 ? 'Aktif' : 'Tidak Aktif',
        coordinator_id: null,
      })
      toast.success('Coordinator berhasil dihapus')
      setCoordinatorId(null)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!area) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Assign Coordinator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Area Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{area.name}</p>
            <p className="text-sm text-muted-foreground">{area.client_name}</p>
          </div>

          {/* Coordinator Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Area Coordinator
            </label>
            <p className="text-xs text-muted-foreground -mt-1">
              Danru untuk RGB, Team Leader untuk RBM
            </p>
            <AsyncSelect
              value={coordinatorId}
              onChange={(value) => setCoordinatorId(value as number | null)}
              loadOptions={loadCoordinators}
              placeholder="Pilih coordinator..."
              isDisabled={isLoading}
              className="w-full"
              allowClear
              defaultOptions
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t">
            <div>
              {coordinatorId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <User className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
