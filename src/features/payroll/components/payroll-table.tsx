/**
 * Payroll Table Component
 * Displays payroll list with filters and generation controls
 */
import { useEffect, useState } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AsyncSelect } from '@/components/async-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePayrollStore } from '../store/payroll-store'
import { PayrollGenerateDialog } from './payroll-generate-dialog'
import { PayrollPayslipModal } from './payroll-payslip-modal'

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
  } = usePayrollStore()

  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchPayroll()
  }, [filters.month, filters.year, filters.type, filters.page, fetchPayroll])

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

  const handleViewPayslip = (id: number) => {
    setSelectedPayrollId(id)
  }

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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                {filters.type === 'monthly' && (
                  <TableHead className="w-[100px]">Days</TableHead>
                )}
                <TableHead className="text-right">Gross</TableHead>
                {filters.type === 'monthly' && (
                  <>
                    <TableHead className="text-right w-[120px]">BPJS (EE)</TableHead>
                    <TableHead className="text-right w-[100px]">PPh21</TableHead>
                  </>
                )}
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={filters.type === 'monthly' ? 6 : 3} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={filters.type === 'monthly' ? 6 : 3}
                    className="text-center py-12"
                  >
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No payslips for this period
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Generate payroll above to create payslips
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <div className="font-medium">{payroll.employee_name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {payroll.employee_code ?? '—'}
                      </div>
                    </TableCell>
                    {filters.type === 'monthly' && (
                      <TableCell className="text-muted-foreground">
                        {payroll.present_days}/{payroll.working_days}
                      </TableCell>
                    )}
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(payroll.gross)}
                    </TableCell>
                    {filters.type === 'monthly' && (
                      <>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(payroll.bpjs_ee)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(payroll.pph21)}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payroll.net)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPayslip(payroll.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total}
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
      </Card>

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
