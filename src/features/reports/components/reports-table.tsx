/**
 * Reports Table Component
 * DataTable with shadcn Table and pagination
 */
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { toast } from 'sonner'
import { useReportsStore } from '../store/reports-store'
import { ReportsFilters } from './reports-filters'

export function ReportsTable() {
  const { items, isLoading, pagination, fetchReports, filters, bulkDelete } =
    useReportsStore()

  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch reports on mount and when filters change
  useEffect(() => {
    fetchReports(filters)
  }, [fetchReports, filters])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    fetchReports({ ...filters, page: newPage })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds).map(Number)
    if (ids.length === 0) return
    setIsDeleting(true)
    try {
      await bulkDelete(ids)
      toast.success(`${ids.length} report(s) deleted`)
      setSelectedIds(new Set())
      setShowBulkDeleteDialog(false)
    } catch {
      toast.error('Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDateTime = (dateTimeString: string | undefined | null) => {
    if (!dateTimeString) return { date: '-', time: '-' }
    try {
      const dt = new Date(dateTimeString)
      const date = dt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })
      const time = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      return { date, time }
    } catch {
      return { date: '-', time: '-' }
    }
  }

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.has(String(item.id)))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(items.map((item) => String(item.id)))
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleRowSelect = (id: number, checked: boolean) => {
    const newSelection = new Set(selectedIds)
    if (checked) {
      newSelection.add(String(id))
    } else {
      newSelection.delete(String(id))
    }
    setSelectedIds(newSelection)
  }

  return (
    <div className="space-y-4">
      <ReportsFilters />

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
            Delete {selectedIds.size} item(s)
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium mb-1">No reports found</p>
                    <p className="text-sm">
                      Try adjusting your filters or check back later
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((report) => {
                const { date, time } = formatDateTime(report.created_at)
                const isSelected = selectedIds.has(String(report.id))
                return (
                <TableRow key={report.id} className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(report.id, e.target.checked)}
                      aria-label={`Select row ${report.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {date}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {time}
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.employee_name}
                  </TableCell>
                  <TableCell>{report.client_name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {report.location}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="truncate" title={report.note}>
                      {report.note}
                    </p>
                  </TableCell>
                </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Massal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedIds.size} report(s)? Tindakan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkDeleteDialog(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
