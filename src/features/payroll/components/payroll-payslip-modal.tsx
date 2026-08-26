/**
 * Payroll Payslip Modal Component
 * Modal to view payslip detail
 */
import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayrollStore } from '../store/payroll-store'

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface PayrollPayslipModalProps {
  payrollId: number | null
  onClose: () => void
}

export function PayrollPayslipModal({ payrollId, onClose }: PayrollPayslipModalProps) {
  const { selectedPayroll, isLoadingDetail, detailError, fetchById, clearDetail } =
    usePayrollStore()

  useEffect(() => {
    if (payrollId) {
      fetchById(payrollId)
    } else {
      clearDetail()
    }
  }, [payrollId, fetchById, clearDetail])

  const handleClose = () => {
    clearDetail()
    onClose()
  }

  const handlePrint = () => {
    window.print()
  }

  const isMonthly = selectedPayroll?.type === 'monthly'
  const periodLabel = isMonthly
    ? `${MONTHS[selectedPayroll?.month ?? 0]} ${selectedPayroll?.year}`
    : `THR ${selectedPayroll?.year}`

  const earnings = selectedPayroll?.breakdown?.earnings ?? []
  const deductions = selectedPayroll?.breakdown?.deductions ?? []
  const totalDeductions = (selectedPayroll?.gross ?? 0) - (selectedPayroll?.net ?? 0)

  return (
    <Dialog open={!!payrollId} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>Payslip - {periodLabel}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        {isLoadingDetail && (
          <div className="space-y-4 py-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {detailError && (
          <div className="text-center py-8">
            <p className="text-red-500">{detailError}</p>
          </div>
        )}

        {selectedPayroll && !isLoadingDetail && (
          <div className="bg-white text-gray-900 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-[#C7A254] flex items-center justify-center text-black font-bold">
                    RGB
                  </div>
                  <div>
                    <p className="font-bold text-lg">RGB-86 Security</p>
                    <p className="text-xs text-gray-500">Payslip</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{selectedPayroll.employee.name}</p>
                  <p className="text-gray-500">NIK: {selectedPayroll.employee.code ?? '—'}</p>
                  <p className="text-gray-500">{periodLabel}</p>
                </div>
              </div>

              {isMonthly && (
                <p className="text-sm text-gray-500 mt-4">
                  Attendance: {selectedPayroll.present_days} / {selectedPayroll.working_days} days
                  {selectedPayroll.ter_category && (
                    <> · TER category {selectedPayroll.ter_category}</>
                  )}
                </p>
              )}
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Earnings */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Earnings
                </p>
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-sm">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 mt-2 border-t border-gray-200 font-semibold">
                  <span>Gross</span>
                  <span>{formatCurrency(selectedPayroll.gross)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Deductions
                </p>
                {deductions.length === 0 ? (
                  <p className="text-gray-400 py-1 text-sm">None</p>
                ) : (
                  deductions.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 text-sm">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between py-2 mt-2 border-t border-gray-200 font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Take Home Pay */}
            <div className="px-6 pb-6">
              <div className="flex justify-end">
                <div className="w-64 flex justify-between bg-gray-50 rounded-lg px-4 py-3 font-bold">
                  <span>Take-home Pay</span>
                  <span>{formatCurrency(selectedPayroll.net)}</span>
                </div>
              </div>
            </div>

            {/* Employer BPJS Info (Monthly only) */}
            {isMonthly && selectedPayroll.bpjs_employer && (
              <div className="px-6 pb-6">
                <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                  Employer BPJS (company cost): Kesehatan{' '}
                  {formatCurrency(selectedPayroll.bpjs_employer.health)} · JHT{' '}
                  {formatCurrency(selectedPayroll.bpjs_employer.jht)} · JP{' '}
                  {formatCurrency(selectedPayroll.bpjs_employer.jp)} · JKK{' '}
                  {formatCurrency(selectedPayroll.bpjs_employer.jkk)} · JKM{' '}
                  {formatCurrency(selectedPayroll.bpjs_employer.jkm)}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
