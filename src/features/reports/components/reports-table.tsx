/**
 * Reports Table Component
 * DataTable with shadcn Table, photo preview, and pagination
 */
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Image, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useReportsStore } from '../store/reports-store'
import { ReportsFilters } from './reports-filters'

export function ReportsTable() {
  const { items, isLoading, pagination, fetchReports, filters } =
    useReportsStore()
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Fetch reports on mount and when filters change
  useEffect(() => {
    fetchReports(filters)
  }, [fetchReports, filters])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    fetchReports({ ...filters, page: newPage })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const parts = timeString.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`
    }
    return timeString
  }

  return (
    <div className="space-y-4">
      <ReportsFilters />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Photo</TableHead>
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
              items.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {formatDate(report.date)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(report.time)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.employee_name}
                  </TableCell>
                  <TableCell>{report.client_name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {report.location}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="truncate" title={report.description}>
                      {report.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    {report.photo_url ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewPhoto(report.photo_url)}
                        className="hover:bg-accent"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
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

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Report Photo</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="flex items-center justify-center">
              {previewPhoto && (
                <div className="relative">
                  <img
                    src={previewPhoto}
                    alt="Report photo"
                    className="max-w-full max-h-[65vh] object-contain rounded-md"
                  />
                  <a
                    href={previewPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
