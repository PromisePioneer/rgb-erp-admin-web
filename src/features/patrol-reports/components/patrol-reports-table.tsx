/**
 * Patrol Reports Table Component
 * READ-ONLY - displays patrol session data with detail modal
 */
import { useEffect, useCallback, useState } from 'react'
import { Eye, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePatrolReportsStore } from '../store/patrol-reports-store'
import { PatrolReportsFilters } from './patrol-reports-filters'
import type { PatrolSession } from '../types/patrol-reports.types'

export function PatrolReportsTable() {
  const {
    items,
    stats,
    isLoading,
    pagination,
    fetchSessions,
    fetchById,
    selectedItem,
    filters,
  } = usePatrolReportsStore()

  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch sessions on mount and when filters change
  useEffect(() => {
    fetchSessions({
      month: filters.month,
      project_id: filters.project_id,
      status: filters.status,
      page: 1,
      per_page: 24,
    })
  }, [filters.month, filters.project_id, filters.status])

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > pagination.last_page) return
      fetchSessions({ ...filters, page: newPage })
    },
    [fetchSessions, filters, pagination.last_page]
  )

  const handleViewDetail = async (session: PatrolSession) => {
    await fetchById(session.id)
    setShowDetailModal(true)
  }

  // Format date/time
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'incomplete':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Define columns
  const columns: DataTableColumn<PatrolSession>[] = [
    {
      accessorKey: 'started_at',
      header: 'Date/Time',
      cell: (row) => (
        <span className="text-sm">{formatDateTime(row.started_at)}</span>
      ),
    },
    {
      accessorKey: 'employee_name',
      header: 'Employee',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.employee_name}</span>
          <span className="text-xs text-muted-foreground">{row.employee_code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'project_name',
      header: 'Project',
      cell: (row) => (
        <span className="text-sm">{row.project_name}</span>
      ),
    },
    {
      accessorKey: 'round_number',
      header: 'Round',
      cell: (row) => (
        <span className="text-muted-foreground">
          Round {row.round_number} ({row.round_start_time})
        </span>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${row.progress_percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${row.progress_percent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{row.progress}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {getStatusIcon(row.status)}
          <span className="text-sm">{row.status_text}</span>
        </div>
      ),
    },
    {
      accessorKey: 'completion_time',
      header: 'Duration',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{row.completion_time ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'invalid_sequences',
      header: 'Issues',
      cell: (row) => (
        <span
          className={`text-sm ${row.invalid_sequences > 0 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}
        >
          {row.invalid_sequences > 0 ? `${row.invalid_sequences} issue(s)` : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetail(row)
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Detail
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <PatrolReportsFilters />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-xl font-bold">{stats.total_sessions}</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-xl font-bold text-yellow-600">{stats.in_progress}</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Incomplete</p>
            <p className="text-xl font-bold text-orange-600">{stats.incomplete}</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Avg Time</p>
            <p className="text-xl font-bold">{stats.avg_completion_time}</p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No patrol sessions found"
      />

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patrol Session Detail</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="font-medium">{selectedItem.session.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedItem.session.employee_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium">{selectedItem.session.project_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Round</p>
                    <p className="font-medium">
                      Round {selectedItem.session.round_number} ({selectedItem.session.round_start_time})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedItem.session.status)}
                      <p className="font-medium">{selectedItem.session.status_text}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Checkpoints</p>
                  <p className="text-lg font-bold">
                    {selectedItem.stats.scanned_count}/{selectedItem.stats.total_checkpoints}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.stats.progress_percent}% complete
                  </p>
                </div>
                <div className="bg-card rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold">{selectedItem.session.completion_time ?? '-'}</p>
                </div>
                <div className="bg-card rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Invalid Sequences</p>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedItem.stats.invalid_sequences}
                  </p>
                </div>
                <div className="bg-card rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="text-sm font-medium">{formatDateTime(selectedItem.session.started_at)}</p>
                </div>
              </div>

              {/* Scans List */}
              <div>
                <h3 className="font-medium mb-3">Scan History</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Checkpoint</th>
                        <th className="px-3 py-2 text-left">Time</th>
                        <th className="px-3 py-2 text-left">Location</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.scans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                            No scans recorded
                          </td>
                        </tr>
                      ) : (
                        selectedItem.scans.map((scan) => (
                          <tr key={scan.index} className="border-t">
                            <td className="px-3 py-2">{scan.index}</td>
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium">{scan.checkpoint_name}</p>
                                <p className="text-xs text-muted-foreground">{scan.checkpoint_code}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono">{scan.scanned_at}</td>
                            <td className="px-3 py-2 font-mono text-xs">
                              {scan.lat?.toFixed(5)}, {scan.lng?.toFixed(5)}
                            </td>
                            <td className="px-3 py-2">
                              {scan.has_warnings ? (
                                <div className="flex flex-wrap gap-1">
                                  {scan.warnings.map((warning, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800"
                                    >
                                      {warning}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="inline-flex items-center text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
