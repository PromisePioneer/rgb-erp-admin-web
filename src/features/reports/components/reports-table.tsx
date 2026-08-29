/**
 * Reports Table Component
 * DataTable with shadcn Table and pagination
 */
import { useEffect } from 'react'
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
import { useReportsStore } from '../store/reports-store'
import { ReportsFilters } from './reports-filters'

export function ReportsTable() {
  const { items, isLoading, pagination, fetchReports, filters } =
    useReportsStore()

  // Fetch reports on mount and when filters change
  useEffect(() => {
    fetchReports(filters)
  }, [fetchReports, filters])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    fetchReports({ ...filters, page: newPage })
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
                return (
                <TableRow key={report.id}>
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
    </div>
  )
}
