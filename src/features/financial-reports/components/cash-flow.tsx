"use client"
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { apiClient } from '@/lib/api-client'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

interface CashFlowSection {
  account_id: number
  account_code: string
  account_name: string
  amount: number
}

interface CashFlowData {
  period_id: number
  period_label: string
  start_date: string
  end_date: string
  operating: CashFlowSection[]
  investing: CashFlowSection[]
  financing: CashFlowSection[]
  totals: {
    operating: number
    investing: number
    financing: number
    net_change: number
    beginning_balance: number
    ending_balance: number
  }
}

// Load periods for AsyncSelect
const loadPeriods = async (search: string): Promise<SelectOption[]> => {
  const { data } = await apiClient.get('/admin/accounting-periods')
  const periods = data.data || []

  // Filter by search term (match label or year)
  const filtered = periods.filter((p: any) =>
    p.label?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.year).includes(search)
  )

  // Sort by year desc, month desc
  filtered.sort((a: any, b: any) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  return filtered.map((p: any) => ({
    value: p.id,
    label: p.label,
    description: `${p.year}-${String(p.month).padStart(2, '0')}`,
  }))
}

export function CashFlowReport() {
  const [data, setData] = useState<CashFlowData | null>(null)
  const [loading, setLoading] = useState(false)
  const [periodId, setPeriodId] = useState<number | null>(null)
  const [defaultPeriod, setDefaultPeriod] = useState<SelectOption | null>(null)

  // Initialize: find current month period and set as default
  useEffect(() => {
    const init = async () => {
      try {
        const { data: res } = await apiClient.get('/admin/accounting-periods')
        const periods = res.data || []

        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        // Find current month period
        const currentPeriod = periods.find((p: any) =>
          p.year === currentYear && p.month === currentMonth
        )

        // Fallback: first open period
        const firstOpenPeriod = periods.find((p: any) => p.status === 'open')

        const selectedPeriod = currentPeriod || firstOpenPeriod || periods[0]

        if (selectedPeriod) {
          const option: SelectOption = {
            value: selectedPeriod.id,
            label: selectedPeriod.label,
            description: `${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}`,
          }
          setDefaultPeriod(option)
          setPeriodId(selectedPeriod.id)
          fetchReport(selectedPeriod.id)
        }
      } catch (error) {
        console.error('Failed to initialize periods:', error)
      }
    }
    init()
  }, [])

  const fetchReport = useCallback(async (id: number) => {
    setLoading(true)
    try {
      const { data: res } = await apiClient.get(`/admin/financial-reports/cash-flow?period_id=${id}`)
      setData(res.data)
    } catch (e) {
      console.error('Failed to fetch report:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePeriodChange = useCallback((value: number | string | null) => {
    if (!value) return
    const id = Number(value)
    setPeriodId(id)
    fetchReport(id)
  }, [fetchReport])

  const handleRefresh = () => {
    if (periodId) {
      fetchReport(periodId)
    }
  }

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
          <h2 className="text-xl font-bold">Laporan Arus Kas</h2>
          <p className="text-sm text-muted-foreground">{data.period_label}</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <AsyncSelect
          value={periodId}
          onChange={handlePeriodChange}
          loadOptions={loadPeriods}
          placeholder="Pilih periode..."
          defaultOption={defaultPeriod}
          className="w-48"
        />
      </div>

      <div className="space-y-4">
        {/* Arus Kas dari Aktivitas Operasional */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-blue-800">Arus Kas dari Aktivitas Operasional</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.operating.map(row => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
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
                <td className="px-4 py-3">Arus Kas Neto - Operasional</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.operating)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Arus Kas dari Aktivitas Investasi */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-green-800">Arus Kas dari Aktivitas Investasi</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.investing.map(row => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
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
                <td className="px-4 py-3">Arus Kas Neto - Investasi</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.investing)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Arus Kas dari Aktivitas Pendanaan */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-purple-800">Arus Kas dari Aktivitas Pendanaan</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.financing.map(row => (
                <tr key={row.account_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
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
                <td className="px-4 py-3">Arus Kas Neto - Pendanaan</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.financing)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-semibold">Saldo Kas Awal Periode</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(data.totals.beginning_balance)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-semibold">Perubahan Kas Neto</td>
                <td className={`px-4 py-3 text-right font-mono ${data.totals.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.totals.net_change >= 0 ? '+' : ''}{formatCurrency(data.totals.net_change)}
                </td>
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="px-4 py-3">Saldo Kas Akhir Periode</td>
                <td className="px-4 py-3 text-right font-mono text-green-600">{formatCurrency(data.totals.ending_balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
