"use client"
import { useEffect } from 'react'
import { RefreshCw, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFinancialReportsStore } from '../store/financial-reports-store'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

export function TrialBalanceReport() {
  const { periods, trialBalance, isLoading, fetchPeriods, fetchTrialBalance, setSelectedPeriodId, selectedPeriodId } = useFinancialReportsStore()

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  const handlePeriodChange = (value: string) => {
    const id = Number(value)
    setSelectedPeriodId(id)
    fetchTrialBalance(id)
  }

  const handlePrint = () => window.print()

  const safePeriods = Array.isArray(periods) ? periods : []
  const safeData = trialBalance
  const safeRows = safeData?.rows || []
  const safeTotals = safeData?.totals || {
    initial_debit: 0,
    initial_credit: 0,
    movement_debit: 0,
    movement_credit: 0,
    final_debit: 0,
    final_credit: 0,
  }

  if (!safeData && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mb-4" />
        <p>Pilih periode untuk melihat laporan</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Neraca Percobaan</h2>
          <p className="text-sm text-muted-foreground">{safeData?.period_label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => selectedPeriodId && fetchTrialBalance(selectedPeriodId)} disabled={isLoading || !selectedPeriodId}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>Periode</Label>
          <Select value={selectedPeriodId ? String(selectedPeriodId) : ''} onValueChange={v => v && handlePeriodChange(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {safePeriods.map((p: any) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Akun</th>
              <th className="px-4 py-3 text-center font-medium" colSpan={2}>Saldo Awal</th>
              <th className="px-4 py-3 text-center font-medium" colSpan={2}>Mutasi</th>
              <th className="px-4 py-3 text-center font-medium" colSpan={2}>Saldo Akhir</th>
            </tr>
            <tr className="text-xs">
              <th className="px-4 py-2 text-left" />
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Kredit</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Kredit</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : safeRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              safeRows.map((row: any) => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs mr-2">{row.account_code}</span>
                    {row.account_name}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.initial_debit > 0 ? formatCurrency(row.initial_debit) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.initial_credit > 0 ? formatCurrency(row.initial_credit) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.movement_debit > 0 ? formatCurrency(row.movement_debit) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.movement_credit > 0 ? formatCurrency(row.movement_credit) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.final_debit > 0 ? formatCurrency(row.final_debit) : '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.final_credit > 0 ? formatCurrency(row.final_credit) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!isLoading && safeRows.length > 0 && (
            <tfoot className="bg-muted/30 font-medium">
              <tr>
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.initial_debit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.initial_credit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.movement_debit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.movement_credit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.final_debit)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeTotals.final_credit)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
