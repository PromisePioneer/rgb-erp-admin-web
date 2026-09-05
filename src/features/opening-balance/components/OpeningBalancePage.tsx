"use client"
import {useEffect, useState, useCallback} from 'react'
import {Save, RefreshCw, AlertCircle, CheckCircle, Info, ArrowRight, Calendar, Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {apiClient} from '@/lib/api-client'

function formatCurrency(v: any) {
    const num = Number(v);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num)
}

function formatCurrencyInput(value: number): string {
    if (!value || isNaN(value) || value === 0) return '';
    return new Intl.NumberFormat('id-ID').format(value);
}

interface Account {
    id: number
    code: string
    name: string
    type: string
}

interface OpeningBalanceData {
    period_id: number
    period_year: number
    period_month: number
    period_label: string
    has_existing: boolean
    existing_entry_id: number | null
    accounts: {
        assets: Account[]
        liabilities: Account[]
        equity: Account[]
    }
    opening_balances: Record<string, { debit: number; credit: number }>
}

interface StatusData {
    year: number
    has_periods: boolean
    has_opening_balance: boolean
    needs_opening_balance: boolean
    first_period: {
        id: number
        label: string
        month: number
    } | null
    previous_year_end_date: string
    suggested_balances: Record<string, {
        code: string
        name: string
        type: string
        suggested_debit: number
        suggested_credit: number
        balance: number
    }>
    message: string
}

interface Entry {
    account_id: number
    debit: number
    credit: number
}

export function OpeningBalancePage() {
    const [data, setData] = useState<OpeningBalanceData | null>(null)
    const [status, setStatus] = useState<StatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [checkingStatus, setCheckingStatus] = useState(true)
    const [saving, setSaving] = useState(false)
    const [entries, setEntries] = useState<Record<number, Entry>>({})
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Check status first (auto-detect if opening balance is needed)
    const checkStatus = useCallback(async () => {
        setCheckingStatus(true)
        try {
            const currentYear = new Date().getFullYear()
            const {data: res} = await apiClient.get(`/admin/opening-balance/status?year=${currentYear}`)
            setStatus(res.data)

            // If opening balance is needed, load data
            if (res.data.needs_opening_balance) {
                loadData()
            }
        } catch (e: any) {
            // If status check fails, still try to load data
            loadData()
        } finally {
            setCheckingStatus(false)
        }
    }, [])

    // Load opening balance data
    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const {data: res} = await apiClient.get('/admin/opening-balance')
            setData(res.data)

            // Initialize entries from existing balances
            const initialEntries: Record<number, Entry> = {}
            const balances = res.data.opening_balances || {}

            // Initialize all accounts with 0 values
            const allAccounts = [
                ...res.data.accounts.assets,
                ...res.data.accounts.liabilities,
                ...res.data.accounts.equity
            ]

            allAccounts.forEach((account: Account) => {
                const existing = balances[account.id]
                initialEntries[account.id] = {
                    account_id: account.id,
                    debit: existing?.debit || 0,
                    credit: existing?.credit || 0,
                }
            })

            setEntries(initialEntries)
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'Gagal mengambil data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        checkStatus()
    }, [checkStatus])

    // Auto-fill from suggested balances (previous year ending balances)
    const handleAutoFill = useCallback(async () => {
        if (!status?.suggested_balances) return

        setLoading(true)
        try {
            // Get fresh data to ensure we have all accounts
            const {data: res} = await apiClient.get('/admin/opening-balance')
            setData(res.data)

            // Initialize with suggested balances
            const initialEntries: Record<number, Entry> = {}
            const allAccounts = [
                ...res.data.accounts.assets,
                ...res.data.accounts.liabilities,
                ...res.data.accounts.equity
            ]

            allAccounts.forEach((account: Account) => {
                const suggested = status.suggested_balances[account.id]
                if (suggested) {
                    initialEntries[account.id] = {
                        account_id: account.id,
                        debit: suggested.suggested_debit || 0,
                        credit: suggested.suggested_credit || 0,
                    }
                } else {
                    initialEntries[account.id] = {
                        account_id: account.id,
                        debit: 0,
                        credit: 0,
                    }
                }
            })

            setEntries(initialEntries)
        } catch (e: any) {
            setError('Gagal auto-fill dari saldo tahun sebelumnya')
        } finally {
            setLoading(false)
        }
    }, [status])

    const handleValueChange = (accountId: number, field: 'debit' | 'credit', value: string) => {
        // Remove non-numeric characters and parse
        const numStr = value.replace(/[^0-9]/g, '')
        const numValue = numStr ? parseInt(numStr, 10) : 0

        setEntries(prev => ({
            ...prev,
            [accountId]: {
                ...prev[accountId],
                [field]: numValue,
                // Clear the other field when editing
                [field === 'debit' ? 'credit' : 'debit']: 0,
            }
        }))
    }

    // Calculate totals for a specific section (assets, liabilities, equity)
    const calculateSectionTotal = (accountIds: number[], field: 'debit' | 'credit') => {
        let total = 0;
        if (entries && typeof entries === 'object') {
            accountIds.forEach(id => {
                const entry = entries[id];
                if (entry && typeof entry === 'object') {
                    total += Number(entry[field]) || 0;
                }
            });
        }
        return total;
    }

    const calculateTotals = () => {
        let totalDebit = 0;
        let totalCredit = 0;

        if (entries && typeof entries === 'object') {
            Object.keys(entries).forEach(key => {
                const entry = entries[Number(key)];
                if (entry && typeof entry === 'object') {
                    totalDebit += Number(entry.debit) || 0;
                    totalCredit += Number(entry.credit) || 0;
                }
            });
        }

        return {totalDebit, totalCredit, difference: totalDebit - totalCredit};
    }

    const handleSave = async () => {
        if (!data) return

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const validEntries = Object.values(entries).filter(e => e.debit > 0 || e.credit > 0)

            const response = await apiClient.post('/admin/opening-balance/save', {
                period_id: data.period_id,
                entries: validEntries,
            })

            setSuccess(response.data.message || 'Saldo Awal berhasil disimpan!')

            // Refresh status
            checkStatus()
        } catch (e: any) {
            setError(e.response?.data?.message || 'Gagal menyimpan data')
        } finally {
            setSaving(false)
        }
    }

    const {totalDebit, totalCredit, difference} = calculateTotals()
    const isBalanced = Math.abs(difference) < 0.01

    // Loading state
    if (checkingStatus) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                <span className="ml-2 text-muted-foreground">Memeriksa status saldo awal...</span>
            </div>
        )
    }

    // Show status message if opening balance not needed
    if (status && !status.needs_opening_balance && !data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Saldo Awal</h2>
                        <p className="text-muted-foreground">
                            Cek status saldo awal untuk periode akuntansi
                        </p>
                    </div>
                </div>

                <Card className="border-green-300 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-green-600"/>
                            <div>
                                <h3 className="font-semibold text-green-800">Saldo Awal Sudah Ada</h3>
                                <p className="text-sm text-green-700">
                                    {status.message}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Akun</CardTitle>
                        <CardDescription>
                            Kelola saldo awal untuk periode akuntansi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={loadData} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2"/>
                            Lihat / Edit Saldo Awal
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Status shows opening balance is needed but no data loaded yet
    if (status?.needs_opening_balance && !data && !loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Saldo Awal</h2>
                        <p className="text-muted-foreground">
                            Tahun {status.year} - Perlu Input Saldo Awal
                        </p>
                    </div>
                    <Button onClick={checkStatus} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2"/>
                        Refresh
                    </Button>
                </div>

                <Card className="border-yellow-300 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-8 w-8 text-yellow-600 shrink-0"/>
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-800">Saldo Awal Belum Diinput</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {status.message}
                                </p>

                                {status.suggested_balances && Object.keys(status.suggested_balances).length > 0 && (
                                    <div className="mt-4">
                                        <Button onClick={handleAutoFill} size="sm"
                                                className="bg-yellow-600 hover:bg-yellow-700">
                                            <ArrowRight className="h-4 w-4 mr-2"/>
                                            Auto-fill dari Saldo Tahun {status.year - 1}
                                        </Button>
                                        <p className="text-xs text-yellow-600 mt-2">
                                            {Object.keys(status.suggested_balances).length} akun ditemukan dari saldo
                                            tahun sebelumnya
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <Button onClick={loadData} variant="outline" size="sm">
                                        <Calendar className="h-4 w-4 mr-2"/>
                                        Input Manual
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {status.first_period && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Periode Pertama</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {status.first_period.label}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    // Loading data
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
        )
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4"/>
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={checkStatus}>Coba Lagi</Button>
            </div>
        )
    }

    // No data state
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="h-12 w-12 text-blue-500 mb-4"/>
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Data</h3>
                <p className="text-muted-foreground mb-4">
                    Tidak ada periode akuntansi. Buat periode terlebih dahulu.
                </p>
                <Button onClick={checkStatus} variant="outline">
                    Refresh
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Saldo Awal</h2>
                    <p className="text-muted-foreground">
                        Masukkan saldo awal neraca untuk periode {data.period_label}
                    </p>
                </div>
                <Button onClick={checkStatus} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2"/>
                    Refresh
                </Button>
            </div>

            {/* Rumus Akuntansi */}
            <Card className="bg-slate-100 border-slate-300">
                <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0">
                            <div
                                className="bg-slate-800 text-white rounded-lg px-3 py-2 font-mono text-sm font-bold text-center">
                                A = L + E
                            </div>
                        </div>
                        <div className="flex-1 text-sm text-slate-700">
                            <div className="font-medium text-slate-900">Rumus Neraca / Persamaan Akuntansi:</div>
                            <div className="space-y-0.5">
                                <div>ASET (Debit) = Kewajiban (Kredit) + Ekuitas (Kredit)</div>
                                <div>Total Debit ({data.accounts.assets.length} akun) = Total Kredit
                                    ({data.accounts.liabilities.length + data.accounts.equity.length} akun)
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-slate-100 border-slate-300">
                <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-slate-600 mt-0.5 shrink-0"/>
                        <div className="text-sm text-slate-800">
                            <p className="font-medium">Petunjuk Pengisian Saldo Awal:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Isi kolom DEBIT untuk akun Aset</li>
                                <li>Isi kolom KREDIT untuk akun Kewajiban dan Ekuitas</li>
                                <li>Total DEBIT harus sama dengan Total KREDIT</li>
                                {status?.suggested_balances && Object.keys(status.suggested_balances).length > 0 && (
                                    <li>
                                        <Button
                                            variant="link"
                                            className="text-blue-700 h-auto p-0 text-sm font-medium"
                                            onClick={handleAutoFill}
                                        >
                                            Klik di sini untuk auto-fill dari saldo tahun sebelumnya
                                        </Button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Success/Error Messages */}
            {success && (
                <div
                    className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0"/>
                    <span className="flex-1">{success}</span>
                    <Button size="sm" variant="ghost" onClick={() => setSuccess(null)}>×</Button>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0"/>
                    <span className="flex-1">{error}</span>
                    <Button size="sm" variant="ghost" onClick={() => setError(null)}>×</Button>
                </div>
            )}

            {data.has_existing && (
                <div
                    className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0"/>
                    <span className="flex-1">Saldo awal sudah ada. Mengisi ulang akan menimpa data sebelumnya.</span>
                </div>
            )}

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ASET */}
                <Card>
                    <CardHeader className="bg-black pb-2">
                        <CardTitle className="text-white font-bold">ASET (DEBET)</CardTitle>
                        <CardDescription className="text-white/60">Akun Aset - masukkan saldo di kolom debet</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col max-h-[500px]">
                            <table className="w-full text-sm">
                                <thead className="bg-black/50 sticky top-0 shrink-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-white">Akun</th>
                                    <th className="px-3 py-2 text-right font-medium text-white w-36">DEBIT (Rp)</th>
                                </tr>
                                </thead>
                            </table>
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <table className="w-full text-sm">
                                    <tbody>
                                    {data.accounts.assets.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada akun aset
                                            </td>
                                        </tr>
                                    ) : (
                                        data.accounts.assets.map(account => (
                                            <tr key={account.id} className="border-b hover:bg-muted/50">
                                                <td className="px-3 py-2">
                                                    <div className="font-mono text-xs text-muted-foreground">{account.code}</div>
                                                    <div className="text-sm">{account.name}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="text"
                                                        className="text-right font-mono h-8"
                                                        value={formatCurrencyInput(entries[account.id]?.debit || 0)}
                                                        onChange={(e) => handleValueChange(account.id, 'debit', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <table className="w-full text-sm">
                                <tfoot className="bg-black/50 sticky bottom-0 shrink-0">
                                <tr>
                                    <td className="px-3 py-2 text-white font-semibold">TOTAL ASET</td>
                                    <td className="px-3 py-2 text-right font-mono text-white font-semibold">
                                        {formatCurrency(calculateSectionTotal(data.accounts.assets.map(a => a.id), 'debit'))}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* KEWAJIBAN */}
                <Card>
                    <CardHeader className="bg-black pb-2">
                        <CardTitle className="text-white">KEWAJIBAN (KREDIT)</CardTitle>
                        <CardDescription className="text-white/60">Akun Kewajiban - masukkan saldo di kolom KREDIT</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col max-h-[500px]">
                            <table className="w-full text-sm">
                                <thead className="bg-black/50 sticky top-0 shrink-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-white">Akun</th>
                                    <th className="px-3 py-2 text-right font-medium text-white w-36">KREDIT (Rp)</th>
                                </tr>
                                </thead>
                            </table>
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <table className="w-full text-sm">
                                    <tbody>
                                    {data.accounts.liabilities.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada akun kewajiban
                                            </td>
                                        </tr>
                                    ) : (
                                        data.accounts.liabilities.map(account => (
                                            <tr key={account.id} className="border-b hover:bg-muted/50">
                                                <td className="px-3 py-2">
                                                    <div className="font-mono text-xs text-muted-foreground">{account.code}</div>
                                                    <div className="text-sm">{account.name}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="text"
                                                        className="text-right font-mono h-8"
                                                        value={formatCurrencyInput(entries[account.id]?.credit || 0)}
                                                        onChange={(e) => handleValueChange(account.id, 'credit', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <table className="w-full text-sm">
                                <tfoot className="bg-black/50 sticky bottom-0 shrink-0">
                                <tr>
                                    <td className="px-3 py-2 text-white font-semibold">TOTAL KEWAJIBAN</td>
                                    <td className="px-3 py-2 text-right font-mono text-white font-semibold">
                                        {formatCurrency(calculateSectionTotal(data.accounts.liabilities.map(a => a.id), 'credit'))}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* EKUITAS */}
                <Card>
                    <CardHeader className="bg-black pb-2">
                        <CardTitle className="text-white">EKUITAS (KREDIT)</CardTitle>
                        <CardDescription className="text-white/60">Akun Ekuitas - masukkan saldo di kolom KREDIT</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col max-h-[500px]">
                            <table className="w-full text-sm">
                                <thead className="bg-black/50 sticky top-0 shrink-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-white">Akun</th>
                                    <th className="px-3 py-2 text-right font-medium text-white w-36">KREDIT (Rp)</th>
                                </tr>
                                </thead>
                            </table>
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <table className="w-full text-sm">
                                    <tbody>
                                    {data.accounts.equity.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada akun ekuitas
                                            </td>
                                        </tr>
                                    ) : (
                                        data.accounts.equity.map(account => (
                                            <tr key={account.id} className="border-b hover:bg-muted/50">
                                                <td className="px-3 py-2">
                                                    <div className="font-mono text-xs text-muted-foreground">{account.code}</div>
                                                    <div className="text-sm">{account.name}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="text"
                                                        className="text-right font-mono h-8"
                                                        value={formatCurrencyInput(entries[account.id]?.credit || 0)}
                                                        onChange={(e) => handleValueChange(account.id, 'credit', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <table className="w-full text-sm">
                                <tfoot className="bg-black/50 sticky bottom-0 shrink-0">
                                <tr>
                                    <td className="px-3 py-2 text-white font-semibold">Total EKUITAS</td>
                                    <td className="px-3 py-2 text-right font-mono text-white font-semibold">
                                        {formatCurrency(calculateSectionTotal(data.accounts.equity.map(a => a.id), 'credit'))}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary & Save */}
            <Card className="border-border bg-black text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        {/* Totals */}
                        <div className="flex items-center gap-12">
                            <div>
                                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Debit</div>
                                <div className="text-2xl font-bold font-mono">{formatCurrency(totalDebit)}</div>
                            </div>
                            <div className="text-white/30 text-2xl">|</div>
                            <div>
                                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Kredit</div>
                                <div className="text-2xl font-bold font-mono">{formatCurrency(totalCredit)}</div>
                            </div>
                            <div className="text-white/30 text-2xl">|</div>
                            <div>
                                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Selisih</div>
                                <div className={`text-2xl font-bold font-mono ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(difference)}
                                </div>
                            </div>
                        </div>

                        {/* Status & Action */}
                        <div className="flex items-center gap-6">
                            {isBalanced ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle className="h-5 w-5"/>
                                    <span className="font-semibold text-sm uppercase tracking-wider">Seimbang</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-400">
                                    <AlertCircle className="h-5 w-5"/>
                                    <span className="font-semibold text-sm uppercase tracking-wider">Tidak Seimbang</span>
                                </div>
                            )}

                            <Button
                                onClick={handleSave}
                                disabled={saving || !isBalanced}
                                variant="secondary"
                                className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2"/>
                                        Simpan Saldo Awal
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
