"use client"
import {useEffect, useState, useCallback} from 'react'
import {RefreshCw, Calendar} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {apiClient} from '@/lib/api-client'

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

const loadPeriods = async (search: string): Promise<SelectOption[]> => {
    const {data} = await apiClient.get('/admin/accounting-periods')
    const periods = data.data || []

    const filtered = periods.filter((p: any) =>
        p.label?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.year).includes(search)
    )

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

export function IncomeStatementReport() {
    const [data, setData] = useState<IncomeStatementData | null>(null)
    const [loading, setLoading] = useState(false)
    const [periodId, setPeriodId] = useState<number | null>(null)
    const [defaultPeriod, setDefaultPeriod] = useState<SelectOption | null>(null)

    useEffect(() => {
        const init = async () => {
            try {
                const {data: res} = await apiClient.get('/admin/accounting-periods')
                const periods = res.data || []

                const now = new Date()
                const currentYear = now.getFullYear()
                const currentMonth = now.getMonth() + 1

                const currentPeriod = periods.find((p: any) =>
                    p.year === currentYear && p.month === currentMonth
                )

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
            const {data: res} = await apiClient.get(`/admin/financial-reports/income-statement?period_id=${id}`)
            console.log('API Response:', res.data)
            console.log('Revenue:', res.data.revenue)
            console.log('Expense:', res.data.expense)
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
                <Calendar className="h-12 w-12 mb-4"/>
                <p>Pilih periode untuk melihat laporan</p>
            </div>
        )
    }

    const {totals} = data
    const isProfit = totals.net_profit >= 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Laporan Laba Rugi</h2>
                    <p className="text-sm text-muted-foreground">
                        {data.period_label}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
                        Refresh
                    </Button>
                </div>
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

            {/* Main Content - Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pendapatan */}
                <Card className="p-0 border-border overflow-hidden">
                    <CardHeader className="bg-black p-3">
                        <CardTitle className="text-white text-sm uppercase tracking-wider font-semibold">
                            Pendapatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-black/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-white/80 uppercase w-full">Akun</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-white/80 uppercase w-36">Jumlah</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.revenue.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    data.revenue.map(row => (
                                        <tr key={row.account_id} className="border-b border-border/30">
                                            <td className="px-4 py-2" style={{paddingLeft: row.level * 16 + 16}}>
                                                <span
                                                    className="font-mono text-xs text-muted-foreground mr-2">{row.account_code}</span>
                                                <span className="text-foreground">{row.account_name}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono">
                                                {formatCurrency(row.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                                <tfoot className="bg-black font-semibold">
                                <tr>
                                    <td className="px-4 py-3 text-white uppercase text-xs">Total Pendapatan</td>
                                    <td className="px-4 py-3 text-right font-mono text-white font-bold">
                                        {formatCurrency(totals.total_revenue)}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Beban */}
                <Card className="p-0 border-border overflow-hidden">
                    <CardHeader className="bg-black p-3">
                        <CardTitle className="text-white text-sm uppercase tracking-wider font-semibold">
                            Beban
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-black/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-white/80 uppercase w-full">Akun</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-white/80 uppercase w-36">Jumlah</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.expense.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    data.expense.map(row => (
                                        <tr key={row.account_id} className="border-b border-border/30">
                                            <td className="px-4 py-2" style={{paddingLeft: row.level * 16 + 16}}>
                                                <span
                                                    className="font-mono text-xs text-muted-foreground mr-2">{row.account_code}</span>
                                                <span className="text-foreground">{row.account_name}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono">
                                                {formatCurrency(row.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                                <tfoot className="bg-black font-semibold">
                                <tr>
                                    <td className="px-4 py-3 text-white uppercase text-xs">Total Beban</td>
                                    <td className="px-4 py-3 text-right font-mono text-white font-bold">
                                        ({formatCurrency(totals.total_expense)})
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary - Black Card */}
            <Card className="border-border bg-black text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-12">
                            <div>
                                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Total Pendapatan
                                </div>
                                <div
                                    className="text-xl font-bold font-mono">{formatCurrency(totals.total_revenue)}</div>
                            </div>
                            <div className="text-white/20 text-2xl">|</div>
                            <div>
                                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Total Beban</div>
                                <div className="text-xl font-bold font-mono">({formatCurrency(totals.total_expense)})
                                </div>
                            </div>
                            <div className="text-white/20 text-2xl">|</div>
                            <div>
                                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                                    {isProfit ? 'Laba Bersih' : 'Rugi Bersih'}
                                </div>
                                <div
                                    className={`text-2xl font-bold font-mono ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                    {isProfit ? '' : '('}{formatCurrency(Math.abs(totals.net_profit))}{isProfit ? '' : ')'}
                                </div>
                            </div>
                        </div>

                        <div
                            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isProfit ? 'Laba' : 'Rugi'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
