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

interface IncomeStatementRow {
  account_id: number
  account_code: string
  account_name: string
  type: string
  amount: number
  parent_id: number | null
  level: number
}

interface IncomeStatementData {
  period_id: number
  period_label: string
  start_date: string
  end_date: string
  revenue: IncomeStatementRow[]
  expense: IncomeStatementRow[]
  totals: {
    total_revenue: number
    total_expense: number
    net_profit: number
  }
}

export function IncomeStatementReport() {
  const [data, setData] = useState<IncomeStatementData | null>(null)
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
      const { data: res } = await apiClient.get(`/admin/financial-reports/income-statement?period_id=${periodId}`)
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

  const { totals } = data
  const isProfit = totals.net_profit >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Laporan Laba Rugi</h2>
          <p className="text-sm text-muted-foreground">{data.period_label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendapatan */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-green-800">PENDAPATAN</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.revenue.map(row => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2" style={{ paddingLeft: row.level * 16 + 16 }}>
                    <span className="font-mono text-xs mr-2">{row.account_code}</span>
                    {row.account_name}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-green-50/50 font-semibold">
              <tr>
                <td className="px-4 py-3">TOTAL PENDAPATAN</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(totals.total_revenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Beban */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-red-800">BEBAN</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.expense.map(row => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2" style={{ paddingLeft: row.level * 16 + 16 }}>
                    <span className="font-mono text-xs mr-2">{row.account_code}</span>
                    {row.account_name}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-red-50/50 font-semibold">
              <tr>
                <td className="px-4 py-3">TOTAL BEBAN</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(totals.total_expense)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">Total Pendapatan</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(totals.total_revenue)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">Total Beban</td>
              <td className="px-4 py-3 text-right font-mono">({formatCurrency(totals.total_expense)})</td>
            </tr>
            <tr className={isProfit ? 'bg-green-50' : 'bg-red-50'}>
              <td className="px-4 py-3 font-bold text-lg">
                {isProfit ? 'LABA BERSIH' : 'RUGI BERSIH'}
              </td>
              <td className={`px-4 py-3 text-right font-mono font-bold text-lg ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totals.net_profit))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
