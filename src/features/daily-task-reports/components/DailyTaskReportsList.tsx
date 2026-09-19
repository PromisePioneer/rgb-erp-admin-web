"use client"

import { useEffect, useState } from "react"
import { useDailyTaskReportsStore } from "../store/daily-task-reports-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  X,
  Filter,
  Calendar,
  Eye,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react"
import { ReportDetailDialog } from "./ReportDetailDialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  reviewed: "bg-purple-100 text-purple-800",
}

const STATUS_LABELS: Record<string, string> = {
  assigned: "Ditugaskan",
  in_progress: "Sedang Dikerjakan",
  completed: "Selesai",
  reviewed: "Direview",
}

export function DailyTaskReportsList() {
  const {
    items,
    stats,
    isLoading,
    error,
    filters,
    pagination,
    fetchReports,
    setFilters,
    clearError,
  } = useDailyTaskReportsStore()

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Fetch on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const handleMonthFilter = (value: string) => {
    setFilters({ month: value || undefined })
    fetchReports({ month: value || undefined })
  }

  const handleStatusFilter = (value: string | null) => {
    setFilters({ status: value === "all" ? undefined : value ?? undefined })
    fetchReports({ status: value === "all" ? undefined : value ?? undefined })
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
    fetchReports({ page })
  }

  const handleView = (id: number) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const handleClearFilters = () => {
    setFilters({})
    fetchReports({})
  }

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed_tasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.reviewed_tasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.in_progress_tasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.month_average_rating != null
                  ? stats.month_average_rating.toFixed(1)
                  : "-"}
                /5
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="month"
            value={filters.month || currentMonth}
            onChange={(e) => handleMonthFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="reviewed">Direview</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Task Item</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No reports found for this period.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.employee_code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.area_name || "-"}</TableCell>
                  <TableCell>
                    {item.duration_minutes ? (
                      <span>{item.duration_minutes} min</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.target_minutes ? (
                      <span>{item.target_minutes} min</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.average_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">
                          {item.average_rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status]}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.end_at
                      ? format(new Date(item.end_at), "dd MMM yyyy, HH:mm", {
                          locale: id,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(item.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
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
            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total
            )}{" "}
            of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <ReportDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        reportId={selectedId}
      />
    </div>
  )
}
