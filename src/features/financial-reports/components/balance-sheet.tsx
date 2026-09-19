"use client"
import {useEffect, useState, useCallback} from 'react'
import {RefreshCw, Calendar, CheckCircle, XCircle} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {apiClient} from '@/lib/api-client'

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
    is_current_year_profit?: boolean
}

interface BalanceSheetData {
    period_id: number
    period_label: string
    end_date: string
    assets: BalanceSheetRow[]
    liabilities: BalanceSheetRow[]
    equity: BalanceSheetRow[]
    current_year_profit: BalanceSheetRow | null
    calculation?: {
        revenue_ytd: number
        expense_ytd: number
        current_year_profit: number
        equity_from_accounts: number
    }
    totals: {
        total_assets: number
        total_liabilities: number
        total_equity: number
        total_liabilities_equity: number
        is_balanced: boolean
        balance_difference: number
    }
}

// Load periods for AsyncSelect
const loadPeriods = async (search: string): Promise<SelectOption[]> => {
    const {data} = await apiClient.get('/admin/accounting-periods')
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

// Row Component for each account line
function AccountRow({row}: { row: BalanceSheetRow }) {
    const isProfitRow = row.account_code === '313.0' && row.is_current_year_profit

    return (
        <tr className={`border-b hover:bg-muted/50 ${isProfitRow ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}>
            <td className="px-4 py-2" style={{paddingLeft: row.level * 16 + 16}}>
                <span className="font-mono text-xs mr-2 text-muted-foreground">{row.account_code}</span>
                <span className={isProfitRow ? 'font-medium' : ''}>{row.account_name}</span>
                {isProfitRow && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 border-yellow-300">
                        YTD
                    </Badge>
                )}
            </td>
            <td className={`px-4 py-2 text-right font-mono ${isProfitRow ? 'font-semibold' : ''}`}>
                <span className={row.amount < 0 ? 'text-red-600' : ''}>
                    {formatCurrency(row.amount)}
                </span>
            </td>
        </tr>
    )
}

// Status Badge Component
function BalanceStatusBadge({isBalanced, difference}: { isBalanced: boolean, difference: number }) {
    if (isBalanced) {
        return (
            <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800 gap-1.5">
                <CheckCircle className="h-3.5 w-3.5"/>
                Balance
            </Badge>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-100 border-red-300 text-red-800 gap-1.5">
                <XCircle className="h-3.5 w-3.5"/>
                Tidak Balance
            </Badge>
            <span className="text-sm text-muted-foreground">
                Selisih: <span className="font-mono text-red-600 font-medium">{formatCurrency(Math.abs(difference))}</span>
            </span>
        </div>
    )
}

// Section Header Component
function SectionHeader({title, colorClass}: { title: string, colorClass: string }) {
    return (
        <div className={`px-4 py-3 border-b ${colorClass}`}>
            <h3 className={`font-semibold ${colorClass.replace('bg-', 'text-').replace('-50', '-800')}`}>
                {title}
            </h3>
        </div>
    )
}

// Section Footer Component
function SectionFooter({label, amount}: { label: string, amount: number }) {
    return (
        <tfoot className="bg-muted/30 font-semibold">
            <tr>
                <td className="px-4 py-3">{label}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(amount)}</td>
            </tr>
        </tfoot>
    )
}

export function BalanceSheetReport() {
    const [data, setData] = useState<BalanceSheetData | null>(null)
    const [loading, setLoading] = useState(false)
    const [periodId, setPeriodId] = useState<number | null>(null)
    const [defaultPeriod, setDefaultPeriod] = useState<SelectOption | null>(null)

    // Initialize: find current month period and set as default
    useEffect(() => {
        const init = async () => {
            try {
                const {data: res} = await apiClient.get('/admin/accounting-periods')
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
            const {data: res} = await apiClient.get(`/admin/financial-reports/balance-sheet?period_id=${id}`)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold">Neraca / Laporan Posisi Keuangan</h2>
                        <BalanceStatusBadge
                            isBalanced={data.totals.is_balanced}
                            difference={data.totals.balance_difference}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Laporan posisi keuangan yang menunjukkan posisi kekayaan (Aset), utang (Kewajiban),
                        dan modal (Ekuitas) perusahaan pada tanggal tertentu.
                        Persamaan dasar: <span className="font-mono font-semibold">Aset = Kewajiban + Ekuitas</span>
                    </p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
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
                <span className="text-sm text-muted-foreground">
                    Per {new Date(data.end_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {/* Three Column Layout: Aset, Kewajiban, Ekuitas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ASET */}
                <div className="border rounded-lg overflow-hidden shadow-sm">
                    <SectionHeader title="ASET" colorClass="bg-blue-50"/>
                    <table className="w-full text-sm">
                        <tbody>
                        {data.assets.length === 0 ? (
                            <tr>
                                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={2}>
                                    Tidak ada data aset
                                </td>
                            </tr>
                        ) : (
                            data.assets.map(row => (
                                <AccountRow key={row.account_id} row={row}/>
                            ))
                        )}
                        </tbody>
                        <SectionFooter label="TOTAL ASET" amount={data.totals.total_assets}/>
                    </table>
                </div>

                {/* KEWAJIBAN */}
                <div className="border rounded-lg overflow-hidden shadow-sm">
                    <SectionHeader title="KEWAJIBAN" colorClass="bg-red-50"/>
                    <table className="w-full text-sm">
                        <tbody>
                        {data.liabilities.length === 0 ? (
                            <tr>
                                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={2}>
                                    Tidak ada data kewajiban
                                </td>
                            </tr>
                        ) : (
                            data.liabilities.map(row => (
                                <AccountRow key={row.account_id} row={row}/>
                            ))
                        )}
                        </tbody>
                        <SectionFooter label="TOTAL KEWAJIBAN" amount={data.totals.total_liabilities}/>
                    </table>
                </div>

                {/* EKUITAS */}
                <div className="border rounded-lg overflow-hidden shadow-sm">
                    <SectionHeader title="EKUITAS" colorClass="bg-purple-50"/>
                    <table className="w-full text-sm">
                        <tbody>
                        {data.equity.length === 0 && !data.current_year_profit ? (
                            <tr>
                                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={2}>
                                    Tidak ada data ekuitas
                                </td>
                            </tr>
                        ) : (
                            <>
                                {data.equity.map(row => (
                                    <AccountRow key={row.account_id} row={row}/>
                                ))}
                                {/* Dynamic Current Year Profit Row */}
                                {data.current_year_profit && (
                                    <AccountRow key="current-year-profit" row={data.current_year_profit}/>
                                )}
                            </>
                        )}
                        </tbody>
                        <SectionFooter label="TOTAL EKUITAS" amount={data.totals.total_equity}/>
                    </table>
                </div>
            </div>

            {/* Verification Summary */}
            <div className="border rounded-lg overflow-hidden bg-muted/20">
                <div className="px-4 py-3 border-b bg-muted/30">
                    <h3 className="font-semibold text-sm">Verifikasi Neraca</h3>
                </div>
                <table className="w-full text-sm">
                    <tbody>
                    <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium">Total Aset</td>
                        <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(data.totals.total_assets)}</td>
                    </tr>
                    <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium text-red-700">Total Kewajiban</td>
                        <td className="px-4 py-2.5 text-right font-mono text-red-700">
                            ({formatCurrency(data.totals.total_liabilities)})
                        </td>
                    </tr>
                    <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium text-purple-700">Total Ekuitas</td>
                        <td className="px-4 py-2.5 text-right font-mono text-purple-700">
                            ({formatCurrency(data.totals.total_equity)})
                        </td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                        <td className="px-4 py-2.5 font-semibold">Total Kewajiban + Ekuitas</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold">
                            {formatCurrency(data.totals.total_liabilities_equity)}
                        </td>
                    </tr>
                    <tr className={data.totals.is_balanced ? 'bg-green-50' : 'bg-red-50'}>
                        <td className={`px-4 py-2.5 font-semibold ${data.totals.is_balanced ? 'text-green-700' : 'text-red-700'}`}>
                            Selisih (Harus = 0)
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono font-semibold ${data.totals.is_balanced ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(data.totals.balance_difference)}
                        </td>
                    </tr>
                    </tbody>
                </table>

                {/* Balance Status Banner */}
                <div className={`px-4 py-3 text-center ${data.totals.is_balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center justify-center gap-2 font-semibold">
                        {data.totals.is_balanced ? (
                            <>
                                <CheckCircle className="h-5 w-5"/>
                                <span>Neraca Seimbang - Total Aset = Total Kewajiban + Ekuitas</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5"/>
                                <span>Neraca Tidak Seimbang - Selisih {formatCurrency(Math.abs(data.totals.balance_difference))}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Calculation Details (Optional - for debugging) */}
            {data.calculation && (
                <details className="border rounded-lg overflow-hidden">
                    <summary className="px-4 py-2 bg-muted/30 cursor-pointer text-sm font-medium hover:bg-muted/50">
                        Detail Perhitungan Laba/Rugi Tahun Berjalan
                    </summary>
                    <div className="p-4 text-sm">
                        <table className="w-full">
                            <tbody>
                            <tr className="border-b">
                                <td className="px-2 py-1.5 text-muted-foreground">Total Pendapatan (Revenue YTD)</td>
                                <td className="px-2 py-1.5 text-right font-mono">{formatCurrency(data.calculation.revenue_ytd)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-2 py-1.5 text-muted-foreground">Total Beban (Expense YTD)</td>
                                <td className="px-2 py-1.5 text-right font-mono text-red-600">
                                    ({formatCurrency(data.calculation.expense_ytd)})
                                </td>
                            </tr>
                            <tr className="bg-yellow-50">
                                <td className="px-2 py-1.5 font-medium">Laba/Rugi Tahun Berjalan</td>
                                <td className={`px-2 py-1.5 text-right font-mono font-semibold ${data.calculation.current_year_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.calculation.current_year_profit)}
                                </td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-2 py-1.5 text-muted-foreground">Ekuitas dari Akun</td>
                                <td className="px-2 py-1.5 text-right font-mono">{formatCurrency(data.calculation.equity_from_accounts)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </details>
            )}
        </div>
    )
}
