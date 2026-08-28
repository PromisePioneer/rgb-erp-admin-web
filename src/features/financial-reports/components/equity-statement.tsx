"use client"
import { useEffect, useState } from 'react'
import { RefreshCw, Calendar } from 'lucide-react'
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

interface EquityChange {
  account_code: string
  account_name: string
  beginning: number
  movement: number
  ending: number
}

interface EquityStatementData {
  period_id: number
  period_label: string
  start_date: string
  end_date: string
  changes: EquityChange[]
  totals: {
    beginning: number
    additions: number
    deductions: number
    ending: number
  }
}

export function EquityStatementReport() {
  const [data, setData] = useState<EquityStatementData | null>(null)
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
      const { data: res } = await apiClient.get(`/admin/financial-reports/equity-statement?period_id=${periodId}`)
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
          <h2 className="text-xl font-bold">Laporan Perubahan Modal</h2>
          <p className="text-sm text-muted-foreground">{data.period_label}</p>
        </div>
        <Button variant="outline" onClick={fetchReport} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
              <th className="px-4 py-3 text-right font-medium">Saldo Awal</th>
              <th className="px-4 py-3 text-right font-medium">Penambahan</th>
              <th className="px-4 py-3 text-right font-medium">Pengurangan</th>
              <th className="px-4 py-3 text-right font-medium">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            {data.changes.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">
                  <span className="font-mono text-xs mr-2">{row.account_code}</span>
                  {row.account_name}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {formatCurrency(row.beginning)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-green-600">
                  {row.movement > 0 ? `+${formatCurrency(row.movement)}` : '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono text-red-600">
                  {row.movement < 0 ? formatCurrency(Math.abs(row.movement)) : '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono font-medium">
                  {formatCurrency(row.ending)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 font-semibold">
            <tr>
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.beginning)}</td>
              <td className="px-4 py-3 text-right font-mono text-green-600">{formatCurrency(data.totals.additions)}</td>
              <td className="px-4 py-3 text-right font-mono text-red-600">{formatCurrency(data.totals.deductions)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.ending)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
