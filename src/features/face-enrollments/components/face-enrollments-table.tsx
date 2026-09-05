/**
 * Face Enrollments Table Component
 * List view with delete functionality
 */
import { useEffect, useState } from 'react'
import type { FaceEnrollment } from '../types/face-enrollments.types'
import { Shield, User } from 'lucide-react'
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

  const handleEdit = (id: number) => {
    // Navigate to edit page or open edit modal
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

  // Define table columns
  const columns: Array<{
    id: string
    header: string
    cell: (item: FaceEnrollment, meta?: { rowIndex: number }) => React.ReactNode
  }> = [
    {
      id: 'index',
      header: '#',
        cell: (_item, meta) => (
          <span className="font-mono text-xs">
            {(pagination.current_page - 1) * pagination.per_page + (meta?.rowIndex ?? 0) + 1}
          </span>
        ),
      },
      {
        id: 'employee',
        header: 'Employee',
        cell: (item) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{item.employee?.name || '-'}</p>
              <p className="text-xs text-muted-foreground">
                {item.employee?.code || 'No code'}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'provider',
        header: 'Provider',
        cell: (item) => <Badge variant="outline">{item.provider || 'Unknown'}</Badge>,
      },
      {
        id: 'photos',
        header: 'Photos',
        cell: (item) => <span className="font-mono">{item.photo_count || 0}</span>,
      },
      {
        id: 'enrolled',
        header: 'Enrolled',
        cell: (item) => (
          <span className="text-muted-foreground">{formatDate(item.enrolled_at)}</span>
        ),
      },
    ]

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
              {columns.map((col) => (
                <TableHead key={col.id} className={col.id === 'actions' ? 'w-[100px]' : ''}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No face enrollments found</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((enrollment, rowIndex) => (
                <TableRow key={enrollment.id} onClick={() => handleEdit(enrollment.id)} className="cursor-pointer hover:bg-muted/50">
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      {col.cell
                        ? col.cell(enrollment, { rowIndex })
                        : String((enrollment as unknown as Record<string, unknown>)[col.id ?? ''] ?? '-')}
                    </TableCell>
                  ))}
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
