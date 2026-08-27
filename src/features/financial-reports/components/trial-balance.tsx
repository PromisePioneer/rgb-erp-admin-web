"use client"
import { useEffect, useState } from 'react'
import { RefreshCw, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

interface TrialBalanceRow {
  account_id: number
  account_code: string
  account_name: string
  type: string
  initial_debit: number
  initial_credit: number
  movement_debit: number
  movement_credit: number
  final_debit: number
  final_credit: number
}

interface TrialBalanceData {
  period_id: number
  period_label: string
  start_date: string
  end_date: string
  rows: TrialBalanceRow[]
  totals: {
    initial_debit: number
    initial_credit: number
    movement_debit: number
    movement_credit: number
    final_debit: number
    final_credit: number
  }
}

export function TrialBalanceReport() {
  const [data, setData] = useState<TrialBalanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [periodId, setPeriodId] = useState<string>('')
  const [periods, setPeriods] = useState<any[]>([])

  useEffect(() => {
    apiClient.get('/admin/accounting-periods').then(res => {
      setPeriods(res.data.data || [])
      const active = res.data.data?.find((p: any) => p.status === 'open')
      if (active) setPeriodId(String(active.id))
    }).catch(console.error)
  }, [])

  const fetchReport = async () => {
    if (!periodId) return
    setLoading(true)
    try {
      const { data: res } = await apiClient.get(`/admin/financial-reports/trial-balance?period_id=${periodId}`)
      setData(res.data)
    } catch (e) {
      console.error('Failed to fetch report:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (periodId) fetchReport()
  }, [periodId])

  const handlePrint = () => window.print()

  if (!data) {
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
          <p className="text-sm text-muted-foreground">{data.period_label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
          <Select value={periodId} onValueChange={v => v && setPeriodId(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p: any) => (
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
            {data.rows.map(row => (
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
            ))}
          </tbody>
          <tfoot className="bg-muted/30 font-medium">
            <tr>
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.initial_debit)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.initial_credit)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.movement_debit)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.movement_credit)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.final_debit)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.final_credit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
