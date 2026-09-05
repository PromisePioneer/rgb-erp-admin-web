/**
 * Payroll Generate Dialog Component
 * Dialog to generate monthly payroll or THR
 */
import { useState } from 'react'
import { RefreshCw, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncSelect } from '@/components/async-select'
import { toast } from 'sonner'
import { usePayrollStore } from '../store/payroll-store'

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

interface PayrollGenerateDialogProps {
  type: 'monthly' | 'thr'
  onClose?: () => void
  onGenerated?: () => void
}

export function PayrollGenerateDialog({
  type,
  onClose,
  onGenerated,
}: PayrollGenerateDialogProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const { generatePayroll, generateThr, isGenerating } = usePayrollStore()

  const isMonthly = type === 'monthly'

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleGenerate = async () => {
    try {
      if (isMonthly) {
        await generatePayroll(month, year)
        const monthName = MONTHS.find((m) => m.value === month)?.label
        toast.success(`Generated payroll for ${monthName} ${year}`)
      } else {
        await generateThr(year)
        toast.success(`Generated THR for ${year}`)
      }
      setOpen(false)
      if (onGenerated) {
        onGenerated()
      }
    } catch {
      toast.error(isMonthly ? 'Failed to generate payroll' : 'Failed to generate THR')
    }
  }

  return (
    <>
      <Button
        variant={isMonthly ? 'default' : 'secondary'}
        onClick={() => setOpen(true)}
      >
        {isMonthly ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </>
        ) : (
          <>
            <Gift className="h-4 w-4 mr-2" />
            Generate THR
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isMonthly ? 'Generate Monthly Payroll' : 'Generate THR'}
            </DialogTitle>
            <DialogDescription>
              {isMonthly
                ? 'Generate payroll for all active employees. Re-running will overwrite existing payslips for the selected period.'
                : 'Generate THR (Tunjangan Hari Raya) for all active employees. Tenure-based: 1× monthly wage for ≥12 months, pro-rated below that.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isMonthly && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <AsyncSelect
                  placeholder="Select month..."
                  loadOptions={async () => MONTHS.map(m => ({ value: String(m.value), label: m.label }))}
                  value={month}
                  onChange={(val) => { if (val) setMonth(Number(val)) }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <AsyncSelect
                placeholder="Select year..."
                loadOptions={async () => YEARS.map(y => ({ value: String(y), label: String(y) }))}
                value={year}
                onChange={(val) => { if (val) setYear(Number(val)) }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isMonthly ? 'Generate Payroll' : 'Generate THR'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
