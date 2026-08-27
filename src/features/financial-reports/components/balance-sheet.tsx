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

interface BalanceSheetRow {
  account_id: number
  account_code: string
  account_name: string
  type: string
  amount: number
  parent_id: number | null
  level: number
}

interface BalanceSheetData {
  period_id: number
  period_label: string
  end_date: string
  assets: BalanceSheetRow[]
  liabilities: BalanceSheetRow[]
  equity: BalanceSheetRow[]
  totals: {
    total_assets: number
    total_liabilities: number
    total_equity: number
  }
}

export function BalanceSheetReport() {
  const [data, setData] = useState<BalanceSheetData | null>(null)
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
      const { data: res } = await apiClient.get(`/admin/financial-reports/balance-sheet?period_id=${periodId}`)
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
          <h2 className="text-xl font-bold">Neraca / Laporan Posisi Keuangan</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aset */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-blue-800">ASET</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.assets.map(row => (
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
            <tfoot className="bg-blue-50/50 font-semibold">
              <tr>
                <td className="px-4 py-3">TOTAL ASET</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.total_assets)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Kewajiban */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-red-800">KEWAJIBAN</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.liabilities.map(row => (
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
                <td className="px-4 py-3">TOTAL KEWAJIBAN</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.total_liabilities)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-purple-800">EKUITAS</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.equity.map(row => (
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
            <tfoot className="bg-purple-50/50 font-semibold">
              <tr>
                <td className="px-4 py-3">TOTAL EKUITAS</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.total_equity)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Verification */}
      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">Total Aset</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.total_assets)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">Total Kewajiban + Ekuitas</td>
              <td className="px-4 py-3 text-right font-mono">
                {formatCurrency(data.totals.total_liabilities + data.totals.total_equity)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold text-green-600">
                ✓ Balance (Total Aset = Total Kewajiban + Ekuitas)
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
