"use client"
import {useEffect, useState, useCallback} from 'react'
import {RefreshCw, Download, Calendar} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {AsyncSelect, type SelectOption} from '@/components/async-select'
import {useFinancialReportsStore} from '../store/financial-reports-store'
import {apiClient} from '@/lib/api-client'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(v)
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

export function TrialBalanceReport() {
    const {
        trialBalance,
        isLoading,
        fetchTrialBalance,
        setSelectedPeriodId,
        selectedPeriodId
    } = useFinancialReportsStore()
    const [defaultPeriod, setDefaultPeriod] = useState<SelectOption | null>(null)

    // Initialize: find current month period and set as default
    useEffect(() => {
        const init = async () => {
            try {
                const {data} = await apiClient.get('/admin/accounting-periods')
                const periods = data.data || []

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
                    setSelectedPeriodId(selectedPeriod.id)
                    fetchTrialBalance(selectedPeriod.id)
                }
            } catch (error) {
                console.error('Failed to initialize periods:', error)
            }
        }
        init()
    }, [])

    const handlePeriodChange = useCallback((value: number | string | null) => {
        if (!value) return
        const id = Number(value)
        setSelectedPeriodId(id)
        fetchTrialBalance(id)
    }, [setSelectedPeriodId, fetchTrialBalance])

    const handleRefresh = () => {
        if (selectedPeriodId) {
            fetchTrialBalance(selectedPeriodId)
        }
    }

    const handlePrint = () => window.print()

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
                <Calendar className="h-12 w-12 mb-4"/>
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
                    <p className="text-sm text-muted-foreground">
                        Neraca percobaan berguna untuk memastikan keseimbangan
                        jumlah debit dan kredit<br/> pada buku besar sekaligus menjadi dasar awal penyusunan laporan
                        keuangan.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading || !selectedPeriodId}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Download className="h-4 w-4 mr-2"/>
                        Print
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end">
                <AsyncSelect
                    value={selectedPeriodId ? Number(selectedPeriodId) : null}
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
                        <th className="px-4 py-3 text-center font-medium" colSpan={2}>Saldo Awal</th>
                        <th className="px-4 py-3 text-center font-medium" colSpan={2}>Mutasi</th>
                        <th className="px-4 py-3 text-center font-medium" colSpan={2}>Saldo Akhir</th>
                    </tr>
                    <tr className="text-xs">
                        <th className="px-4 py-2 text-left"/>
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
