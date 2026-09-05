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

export function EquityStatementReport() {
  const [data, setData] = useState<EquityStatementData | null>(null)
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
      const { data: res } = await apiClient.get(`/admin/financial-reports/equity-statement?period_id=${id}`)
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
          <h2 className="text-xl font-bold">Laporan Perubahan Modal</h2>
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
