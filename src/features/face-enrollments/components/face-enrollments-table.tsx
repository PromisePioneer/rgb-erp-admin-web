/**
 * Face Enrollments Table Component
 * List view with delete functionality
 */
import { useEffect, useState } from 'react'
import { Eye, Trash2, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useFaceEnrollmentsStore } from '../store/face-enrollments-store'
import { FaceEnrollmentsFilters } from './face-enrollments-filters'
import { FaceEnrollmentsDetailModal } from './face-enrollments-detail-modal'

export function FaceEnrollmentsTable() {
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    filters,
    pagination,
    fetchEnrollments,
    remove,
    setFilters,
    clearError,
  } = useFaceEnrollmentsStore()

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Fetch on mount and filter change
  useEffect(() => {
    fetchEnrollments()
  }, [filters])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await remove(deleteId)
      toast.success('Face enrollment deleted successfully')
      setDeleteId(null)
    } catch {
      // Error already handled in store
    }
  }

  const handleViewDetail = (id: number) => {
    setDetailId(id)
    setDetailOpen(true)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = pagination.last_page
  const currentPage = pagination.current_page

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FaceEnrollmentsFilters />

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[40px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No face enrollments found</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((enrollment, index) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-mono text-xs">
                    {(pagination.current_page - 1) * pagination.per_page + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{enrollment.employee?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.employee?.code || 'No code'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{enrollment.provider || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{enrollment.photo_count || 0}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(enrollment.enrolled_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(enrollment.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(enrollment.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pagination.per_page + 1} to{' '}
            {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Face Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this face enrollment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Modal */}
      <FaceEnrollmentsDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        enrollmentId={detailId}
      />
    </div>
  )
}
