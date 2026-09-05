/**
 * Payroll Table Component
 * Displays payroll list with filters and generation controls
 */
import { useEffect, useState } from 'react'
import { FileText, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AsyncSelect } from '@/components/async-select'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { usePayrollStore } from '../store/payroll-store'
import { PayrollGenerateDialog } from './payroll-generate-dialog'
import { PayrollPayslipModal } from './payroll-payslip-modal'
import { toast } from 'sonner'
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

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const YEARS = [
  new Date().getFullYear() - 2,
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
]

const TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'thr', label: 'THR' },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface PayrollRow {
  id: number
  employee_name: string | null
  employee_code: string | null
  present_days: number
  working_days: number
  gross: number
  bpjs_ee: number
  pph21: number
  net: number
}

export function PayrollTable() {
  const {
    items,
    isLoading,
    error,
    pagination,
    filters,
    fetchPayroll,
    setFilters,
    clearError,
    bulkDelete,
  } = usePayrollStore()

  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchPayroll()
  }, [filters.month, filters.year, filters.type, filters.page, fetchPayroll])

  const handleSelectionChange = (newSelectedIds: Set<number | string>) => {
    setSelectedIds(newSelectedIds)
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds).map(Number)
    if (ids.length === 0) return
    try {
      await bulkDelete(ids)
      toast.success(`${ids.length} item(s) deleted`)
      setSelectedIds(new Set())
      setShowBulkDeleteDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const handleMonthChange = (value: string | number | null) => {
    if (!value) return
    setFilters({ month: parseInt(String(value), 10) })
  }

  const handleYearChange = (value: string | number | null) => {
    if (!value) return
    setFilters({ year: parseInt(String(value), 10) })
  }

  const handleTypeChange = (value: string | number | null) => {
    if (!value) return
    setFilters({ type: String(value) as 'monthly' | 'thr' })
  }

  const handlePageChange = (newPage: number) => {
    if (!pagination) return
    if (newPage < 1 || newPage > pagination.last_page) return
    setFilters({ page: newPage })
  }

  const handleEdit = (row: PayrollRow) => {
    setSelectedPayrollId(row.id)
  }

  // Define base columns
  const baseColumns: DataTableColumn<PayrollRow>[] = [
    {
      accessorKey: 'employee_name',
      header: 'Employee',
      cell: (row: PayrollRow) => (
        <div>
          <div className="font-medium">{row.employee_name ?? '—'}</div>
          <div className="text-xs text-muted-foreground">
            {row.employee_code ?? '—'}
          </div>
        </div>
      ),
    },
  ]

  // Add days column for monthly type
  if (filters.type === 'monthly') {
    baseColumns.push({
      accessorKey: 'days',
      header: 'Days',
      className: 'w-[100px]',
      cell: (row: PayrollRow) => (
        <span className="text-muted-foreground">
          {row.present_days}/{row.working_days}
        </span>
      ),
    })
  }

  baseColumns.push(
    {
      accessorKey: 'gross',
      header: 'Gross',
      className: 'text-right',
      cell: (row: PayrollRow) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.gross)}
        </span>
      ),
    }
  )

  // Add BPJS and PPh21 columns for monthly type
  if (filters.type === 'monthly') {
    baseColumns.push(
      {
        accessorKey: 'bpjs_ee',
        header: 'BPJS (EE)',
        className: 'text-right w-[120px]',
        cell: (row: PayrollRow) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.bpjs_ee)}
          </span>
        ),
      },
      {
        accessorKey: 'pph21',
        header: 'PPh21',
        className: 'text-right w-[100px]',
        cell: (row: PayrollRow) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.pph21)}
          </span>
        ),
      }
    )
  }

  baseColumns.push({
    accessorKey: 'net',
    header: 'Net',
    className: 'text-right font-medium',
    cell: (row: PayrollRow) => formatCurrency(row.net),
  })

  const currentMonthName = MONTHS.find((m) => m.value === filters.month)?.label || ''

  return (
    <div className="space-y-4">
      {/* Generate Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Generate Monthly Payroll</h3>
              <p className="text-sm text-muted-foreground">
                Generate payroll for all active employees
              </p>
            </div>
            <Button onClick={() => setShowGenerateDialog(true)} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Generate THR</h3>
              <p className="text-sm text-muted-foreground">
                Tenure-based THR for all active employees
              </p>
            </div>
            <PayrollGenerateDialog type="thr" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Type</label>
          <AsyncSelect
            placeholder="Select type..."
            loadOptions={async () => TYPE_OPTIONS.map(t => ({ value: String(t.value), label: t.label }))}
            value={filters.type}
            onChange={handleTypeChange}
            className="w-32"
          />
        </div>

        {filters.type === 'monthly' && (
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Month</label>
            <AsyncSelect
              placeholder="Select month..."
              loadOptions={async () => MONTHS.map(m => ({ value: String(m.value), label: m.label }))}
              value={filters.month}
              onChange={handleMonthChange}
              className="w-40"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Year</label>
          <AsyncSelect
            placeholder="Select year..."
            loadOptions={async () => YEARS.map(y => ({ value: String(y), label: String(y) }))}
            value={filters.year}
            onChange={handleYearChange}
            className="w-28"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {filters.type === 'monthly'
            ? `${currentMonthName} ${filters.year}`
            : `THR ${filters.year}`}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
          <Button variant="link" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={baseColumns}
        data={items as PayrollRow[]}
        pagination={pagination ?? { current_page: 1, per_page: 10, last_page: 1, total: 0 }}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        emptyMessage="No payslips for this period"
        rowKey="id"
        onRowClick={handleEdit}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        bulkActions={
          selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete {selectedIds.size} item(s)
            </Button>
          )
        }
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payroll Records</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected payroll record(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payslip Modal */}
      <PayrollPayslipModal
        payrollId={selectedPayrollId}
        onClose={() => setSelectedPayrollId(null)}
      />

      {/* Generate Dialog */}
      {showGenerateDialog && (
        <PayrollGenerateDialog
          type="monthly"
          onClose={() => setShowGenerateDialog(false)}
          onGenerated={() => setShowGenerateDialog(false)}
        />
      )}
    </div>
  )
}
