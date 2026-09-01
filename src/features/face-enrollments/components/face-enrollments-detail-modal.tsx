/**
 * Face Enrollments Detail Modal Component
 * Shows enrollment details and photos
 */
import { useEffect } from 'react'
import { User, Calendar, Camera, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useFaceEnrollmentsStore } from '../store/face-enrollments-store'

interface FaceEnrollmentsDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollmentId: number | null
}

export function FaceEnrollmentsDetailModal({
  open,
  onOpenChange,
  enrollmentId,
}: FaceEnrollmentsDetailModalProps) {
  const { selectedItem, isLoading, fetchById, resetForm } = useFaceEnrollmentsStore()

  useEffect(() => {
    if (open && enrollmentId) {
      fetchById(enrollmentId)
    } else if (!open) {
      resetForm()
    }
  }, [open, enrollmentId, fetchById, resetForm])

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Face Enrollment Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : selectedItem ? (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedItem.employee?.name || '-'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.employee?.code || 'No code'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Enrolled:</span>
                  <span>{formatDate(selectedItem.enrolled_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Provider:</span>
                  <Badge variant="outline">{selectedItem.provider || 'Unknown'}</Badge>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4" />
                Photos ({selectedItem.photos?.length || 0})
              </h4>

              {selectedItem.photos && selectedItem.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {selectedItem.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
                    >
                      <img
                        src={`/api/admin/face-enrollments/${selectedItem.id}/photo?photo=${photo.id}`}
                        alt={`Photo ${photo.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
                        <div className="flex justify-between">
                          <span>Q: {Number(photo.quality).toFixed(2)}</span>
                          <span>C: {Number(photo.confidence).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No photos available</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{formatDate(selectedItem.created_at)}</span>
              </div>
              {selectedItem.facegallery_id && (
                <div className="flex justify-between mt-1">
                  <span>FaceGallery ID:</span>
                  <code className="text-xs bg-muted px-1 rounded">
                    {selectedItem.facegallery_id}
                  </code>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No enrollment selected</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
