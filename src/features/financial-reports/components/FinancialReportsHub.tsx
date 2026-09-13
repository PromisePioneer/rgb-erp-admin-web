/**
 * Financial Reports Hub Component
 * Unified page for: Trial Balance, Income Statement, Balance Sheet, Cash Flow, Equity Statement
 * With charts and optimized data
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Scale,
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Recharts for charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts'

// Types
type ReportTab = 'trial-balance' | 'income-statement' | 'balance-sheet' | 'cash-flow' | 'equity-statement'

interface ReportTabItem {
  id: ReportTab
  name: string
  nameId: string
  description: string
  icon: typeof Scale
  color: string
}

// Tab configuration
const reportTabs: ReportTabItem[] = [
  {
    id: 'trial-balance',
    name: 'Trial Balance',
    nameId: 'Neraca Percobaan',
    description: 'Daftar saldo akun',
    icon: Scale,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'income-statement',
    name: 'Income Statement',
    nameId: 'Laporan Laba Rugi',
    description: 'Pendapatan dan beban',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    nameId: 'Neraca',
    description: 'Posisi keuangan',
    icon: Wallet,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    nameId: 'Arus Kas',
    description: 'Arus masuk dan keluar',
    icon: BarChart3,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'equity-statement',
    name: 'Equity Statement',
    nameId: 'Perubahan Modal',
    description: 'Perubahan modal',
    icon: PieChart,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
]

// Tab titles
const TabTitles: Record<ReportTab, { title: string; subtitle: string }> = {
  'trial-balance': {
    title: 'Neraca Percobaan',
    subtitle: 'Daftar saldo akun per periode'
  },
  'income-statement': {
    title: 'Laporan Laba Rugi',
    subtitle: 'Pendapatan, beban, dan laba/rugi'
  },
  'balance-sheet': {
    title: 'Neraca',
    subtitle: 'Posisi keuangan aset, liabilitas, modal'
  },
  'cash-flow': {
    title: 'Laporan Arus Kas',
    subtitle: 'Arus kas dari aktivitas operasional, investasi, pembiayaan'
  },
  'equity-statement': {
    title: 'Laporan Perubahan Modal',
    subtitle: 'Perubahan modal per periode'
  },
}

// API Functions
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8800'}/api`

async function fetchReport(tab: ReportTab, periodId?: number) {
  const endpoints: Record<ReportTab, string> = {
    'trial-balance': `/admin/financial-reports/trial-balance${periodId ? `?period_id=${periodId}` : ''}`,
    'income-statement': `/admin/financial-reports/income-statement${periodId ? `?period_id=${periodId}` : ''}`,
    'balance-sheet': `/admin/financial-reports/balance-sheet${periodId ? `?period_id=${periodId}` : ''}`,
    'cash-flow': `/admin/financial-reports/cash-flow${periodId ? `?period_id=${periodId}` : ''}`,
    'equity-statement': `/admin/financial-reports/equity-statement${periodId ? `?period_id=${periodId}` : ''}`,
  }

  try {
    const response = await fetch(`${API_URL}${endpoints[tab]}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch report:', error)
    throw error
  }
}

async function fetchPeriods() {
  try {
    // Use the main accounting-periods endpoint instead of select-options
    const response = await fetch(`${API_URL}/admin/accounting-periods`, {
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    // Extract periods from the paginated response
    const periods = data.data?.data || data.data || []
    return periods.map((p: any) => ({
      id: p.id,
      label: p.label || `${p.year}-${String(p.month).padStart(2, '0')}`,
      year: p.year,
      month: p.month,
    }))
  } catch (error) {
    console.error('Failed to fetch periods:', error)
    // Return empty array to prevent crash
    return []
  }
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Trial Balance Component
function TrialBalanceContent({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
  }

  if (!data) return null

  const { rows, totals } = data

  // Chart data
  const chartData = rows?.slice(0, 10).map((row: any) => ({
    name: row.account_code,
    debit: row.final_debit || 0,
    credit: row.final_credit || 0,
  })) || []

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grafik Neraca Percobaan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="debit" name="Debit" fill="#0ea5e9" />
              <Bar dataKey="credit" name="Kredit" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Akun</th>
                  <th className="px-4 py-3 text-right font-medium">Debit</th>
                  <th className="px-4 py-3 text-right font-medium">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs mr-2">{row.account_code}</span>
                      {row.account_name}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.final_debit > 0 ? formatCurrency(row.final_debit) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.final_credit > 0 ? formatCurrency(row.final_credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-semibold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals?.final_debit || 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals?.final_credit || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Income Statement Component
function IncomeStatementContent({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
  }

  if (!data) return null

  const { revenue, totals } = data

  // Chart data
  const chartData = [
    { name: 'Pendapatan', value: totals?.total_revenue || 0, color: '#22c55e' },
    { name: 'Beban', value: totals?.total_expense || 0, color: '#ef4444' },
    { name: 'Laba/Rugi', value: Math.abs(totals?.net_profit || 0), color: (totals?.net_profit || 0) >= 0 ? '#22c55e' : '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perbandingan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Total Pendapatan</span>
                <span className="font-bold text-green-700">{formatCurrency(totals?.total_revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="font-medium text-red-700">Total Beban</span>
                <span className="font-bold text-red-700">{formatCurrency(totals?.total_expense || 0)}</span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-lg ${(totals?.net_profit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className={`font-medium ${(totals?.net_profit || 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {(totals?.net_profit || 0) >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
                </span>
                <span className={`font-bold ${(totals?.net_profit || 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {formatCurrency(Math.abs(totals?.net_profit || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Pendapatan</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {revenue?.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs mr-2">{item.account_code}</span>
                      {item.account_name}
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Balance Sheet Component
function BalanceSheetContent({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
  }

  if (!data) return null

  const { assets, liabilities, equity, totals, calculation } = data

  // Chart data
  const chartData = [
    { name: 'Aset', value: totals?.total_assets || 0 },
    { name: 'Liabilitas', value: totals?.total_liabilities || 0 },
    { name: 'Modal', value: totals?.total_equity || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-600 font-medium">Total Aset</div>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totals?.total_assets || 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-sm text-red-600 font-medium">Total Liabilitas</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totals?.total_liabilities || 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-sm text-green-600 font-medium">Total Modal</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totals?.total_equity || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Komposisi Neraca</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ef4444" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </RePieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">ASET</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {assets?.slice(0, 10).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.account_name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals?.total_assets || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700">LIABILITAS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {liabilities?.slice(0, 10).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.account_name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-red-50 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals?.total_liabilities || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Equity */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-700">MODAL</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {equity?.slice(0, 10).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.account_name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {calculation?.current_year_profit > 0 && (
                  <tr className="bg-green-100">
                    <td className="px-3 py-2 font-medium">Laba Tahun Berjalan</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(calculation.current_year_profit)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-green-50 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals?.total_equity || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Balance Check */}
      {totals?.is_balanced ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-center font-medium">
          ✓ Neraca Seimbang
        </div>
      ) : (
        <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg text-center font-medium">
          ✗ Neraca Tidak Seimbang (Selisih: {formatCurrency(totals?.balance_difference || 0)})
        </div>
      )}
    </div>
  )
}

// Cash Flow Component
function CashFlowContent({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
  }

  if (!data) return null

  const { totals } = data

  const chartData = [
    { name: 'Operasional', value: totals?.operating || 0 },
    { name: 'Investasi', value: totals?.investing || 0 },
    { name: 'Pendanaan', value: totals?.financing || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">Awal</div>
            <div className="text-xl font-bold">{formatCurrency(totals?.beginning_balance || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">Operasional</div>
            <div className={cn("text-xl font-bold", (totals?.operating || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(totals?.operating || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">Investasi</div>
            <div className={cn("text-xl font-bold", (totals?.investing || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(totals?.investing || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">Pendanaan</div>
            <div className={cn("text-xl font-bold", (totals?.financing || 0) >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(totals?.financing || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arus Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" name="Jumlah" fill="#0ea5e9">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ending Balance */}
      <Card className="bg-primary/10">
        <CardContent className="pt-6 text-center">
          <div className="text-sm text-muted-foreground">SALDO AKHIR</div>
          <div className="text-3xl font-bold text-primary">{formatCurrency(totals?.ending_balance || 0)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Equity Statement Component
function EquityStatementContent({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
  }

  if (!data) return null

  const { changes, totals } = data

  // Chart
  const chartData = changes?.slice(0, 8).map((c: any) => ({
    name: c.account_code,
    awal: c.beginning,
    movement: c.movement,
    akhir: c.ending,
  })) || []

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perubahan Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="awal" name="Awal" fill="#94a3b8" />
              <Bar dataKey="movement" name="Perubahan" fill="#0ea5e9" />
              <Bar dataKey="akhir" name="Akhir" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Akun Modal</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo Awal</th>
                  <th className="px-4 py-3 text-right font-medium">Perubahan</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {changes?.map((change: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs mr-2">{change.account_code}</span>
                      {change.account_name}
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(change.beginning)}</td>
                    <td className={cn("px-4 py-2 text-right", change.movement >= 0 ? "text-green-600" : "text-red-600")}>
                      {change.movement >= 0 ? '+' : ''}{formatCurrency(change.movement)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(change.ending)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-semibold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals?.beginning || 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals?.ending - totals?.beginning)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals?.ending || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Component
export function FinancialReportsHub() {
  const [activeTab, setActiveTab] = useState<ReportTab>('trial-balance')
  const [periodId, setPeriodId] = useState<string>('')
  const [periods, setPeriods] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch periods on mount
  useEffect(() => {
    fetchPeriods()
      .then(setPeriods)
      .catch(console.error)
  }, [])

  // Fetch report data when tab or period changes
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchReport(activeTab, periodId ? parseInt(periodId) : undefined)
      if (data.success) {
        setReportData(data.data || data)
      } else {
        setError(data.message || 'Gagal memuat laporan')
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, periodId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Render content based on active tab
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Gagal memuat data</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            Coba Lagi
          </Button>
        </div>
      )
    }

    switch (activeTab) {
      case 'trial-balance':
        return <TrialBalanceContent data={reportData} isLoading={isLoading} />
      case 'income-statement':
        return <IncomeStatementContent data={reportData} isLoading={isLoading} />
      case 'balance-sheet':
        return <BalanceSheetContent data={reportData} isLoading={isLoading} />
      case 'cash-flow':
        return <CashFlowContent data={reportData} isLoading={isLoading} />
      case 'equity-statement':
        return <EquityStatementContent data={reportData} isLoading={isLoading} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* ===== LEFT SIDEBAR - Report Navigation ===== */}
      <div className="w-72 flex-shrink-0 overflow-y-auto rounded-lg border bg-card">
        <div className="sticky top-0 z-10 border-b bg-card px-4 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Laporan Keuangan
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Pilih jenis laporan
          </p>
        </div>

        {/* Report Navigation */}
        <div className="p-3">
          <div className="space-y-1">
            {reportTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all',
                    isActive
                      ? `${tab.color} border bg-card shadow-sm`
                      : 'border-transparent bg-card hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-background/80 shadow-sm'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className={cn(
                      'text-sm font-semibold',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {tab.nameId}
                    </span>
                    <span className={cn(
                      'text-xs',
                      isActive ? 'text-foreground/70' : 'text-muted-foreground'
                    )}>
                      {tab.description}
                    </span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-transform',
                      isActive ? 'text-foreground' : 'text-muted-foreground/50'
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== RIGHT CONTENT ===== */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        {/* Content Header */}
        <div className="flex-shrink-0 border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Keuangan</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-foreground">
                  {TabTitles[activeTab].title}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                {TabTitles[activeTab].title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {TabTitles[activeTab].subtitle}
              </p>
            </div>

            {/* Period Selector & Refresh */}
            <div className="flex items-center gap-2">
              <Select value={periodId} onValueChange={(value) => value && setPeriodId(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={String(period.id)}>
                      {period.label || `${period.month}/${period.year}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
