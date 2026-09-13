/**
 * Payroll Generate Dialog Component
 * Dialog to generate monthly payroll or THR
 */
import { useState } from 'react'
import { RefreshCw, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Dialog, {
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
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
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
        toast.success(`Berhasil generate payroll ${monthName} ${year}`)
      } else {
        await generateThr(year)
        toast.success(`Berhasil generate THR ${year}`)
      }
      setOpen(false)
      if (onGenerated) {
        onGenerated()
      }
    } catch {
      toast.error(isMonthly ? 'Gagal generate payroll' : 'Gagal generate THR')
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
              {isMonthly ? 'Generate Gaji Bulanan' : 'Generate THR'}
            </DialogTitle>
            <DialogDescription>
              {isMonthly
                ? 'Generate payroll untuk semua karyawan aktif. Menggabungkan data yang sudah ada untuk periode yang dipilih.'
                : 'Generate THR (Tunjangan Hari Raya) untuk semua karyawan aktif. Berdasarkan masa kerja: 1× upah bulanan untuk ≥12 bulan, proporsional di bawahnya.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isMonthly && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Bulan</label>
                <AsyncSelect
                  placeholder="Pilih bulan..."
                  loadOptions={async () => MONTHS.map(m => ({ value: String(m.value), label: m.label }))}
                  value={month}
                  onChange={(val) => { if (val) setMonth(Number(val)) }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun</label>
              <AsyncSelect
                placeholder="Pilih tahun..."
                loadOptions={async () => YEARS.map(y => ({ value: String(y), label: String(y) }))}
                value={year}
                onChange={(val) => { if (val) setYear(Number(val)) }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
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
