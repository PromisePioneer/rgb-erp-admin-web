"use client"
import {useEffect, useState} from 'react'
import {RefreshCw, Plus, Pencil, Trash2, TrendingDown, Calculator, History} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Badge} from '@/components/ui/badge'
import {Input} from '@/components/ui/input'
import {useFixedAssetsStore, type FixedAsset} from '@/features/fixed-assets'
import {FixedAssetFormModal} from '@/features/fixed-assets'
import {DisposeAssetModal} from './dispose-asset-modal'
import {DepreciationHistoryModal} from '@/features/fixed-assets'
import {toast} from 'sonner'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(v)
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function FixedAssetsTable() {
    const {
        assets,
        isLoading,
        fetchAssets,
        deleteAsset,
        setFilters,
        filters,
        calculateDepreciationBatch
    } = useFixedAssetsStore()

    const [search, setSearch] = useState('')
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [disposeModalOpen, setDisposeModalOpen] = useState(false)
    const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [batchResult, setBatchResult] = useState<any>(null)
    const [isCalculatingDepreciation, setIsCalculatingDepreciation] = useState(false)

    useEffect(() => {
        fetchAssets()
    }, [fetchAssets])

    const handleStatusChange = (value: string) => {
        setFilters({...filters, status: value === 'all' ? undefined : value})
    }

    const handleSearch = (value: string) => {
        setSearch(value)
        // Search is handled by filtering locally for now
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>
            case 'disposed':
                return <Badge variant="secondary">Dilepaskan</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handleEdit = (asset: FixedAsset) => {
        setSelectedAsset(asset)
        setFormModalOpen(true)
    }

    const handleDelete = async (asset: FixedAsset) => {
        if (!confirm(`Hapus aktiva "${asset.name}" (${asset.code})?`)) return

        try {
            await deleteAsset(asset.id)
        } catch (e) {
            // Error handled by store
        }
    }

    const handleDispose = (asset: FixedAsset) => {
        setSelectedAsset(asset)
        setDisposeModalOpen(true)
    }

    const handleFormClose = () => {
        setFormModalOpen(false)
        setSelectedAsset(null)
    }

    const handleDisposeClose = () => {
        setDisposeModalOpen(false)
        setSelectedAsset(null)
    }

    const handleViewHistory = (asset: FixedAsset) => {
        setSelectedAsset(asset)
        setHistoryModalOpen(true)
    }

    const handleBatchDepreciation = async () => {
        if (!confirm('Hitung semua sisa penyusutan sampai aset fully depreciated?')) return

        setIsCalculatingDepreciation(true)
        try {
            const result = await calculateDepreciationBatch()
            if (result) {
                setBatchResult(result)
                toast.success(result.message)
            }
        } catch (e: any) {
            toast.error(e?.message)
        } finally {
            setIsCalculatingDepreciation(false)
        }
    }

    const handleBatchResultClose = () => {
        setBatchResult(null)
        fetchAssets()
    }

    // Filter assets by search
    const filteredAssets = search
        ? assets.filter(
            a =>
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.code.toLowerCase().includes(search.toLowerCase()) ||
                a.category.toLowerCase().includes(search.toLowerCase())
        )
        : assets

    // Calculate accumulated depreciation from acquisition_date to now
    const calculateAccumulatedDepreciation = (asset: FixedAsset) => {
        const acqDate = new Date(asset.acquisition_date)
        const now = new Date()

        if (acqDate > now) {
            return 0
        }

        // Get useful_life_months from tangible_asset_class or default to 60
        const usefulLifeMonths = asset.tangible_asset_class?.useful_life || 60

        let monthsOwned = (now.getFullYear() - acqDate.getFullYear()) * 12 + (now.getMonth() - acqDate.getMonth()) + 1
        monthsOwned = Math.min(monthsOwned, usefulLifeMonths)

        if (monthsOwned <= 0) {
            return 0
        }

        const depreciableAmount = Number(asset.acquisition_cost) - Number(asset.salvage_value || 0)
        const monthlyDep = depreciableAmount / usefulLifeMonths
        return Math.round(monthlyDep * monthsOwned)
    }

    const calculateBookValue = (asset: FixedAsset) => {
        return Number(asset.acquisition_cost) - calculateAccumulatedDepreciation(asset)
    }

    const summary = {
        total_cost: assets.reduce((sum, a) => sum + Number(a.acquisition_cost), 0),
        total_accumulated: assets.reduce((sum, a) => sum + calculateAccumulatedDepreciation(a), 0),
        total_book_value: assets.reduce((sum, a) => sum + calculateBookValue(a), 0),
    }

    const getAssetDisplayDepreciation = (asset: FixedAsset) => calculateAccumulatedDepreciation(asset)
    const getAssetDisplayBookValue = (asset: FixedAsset) => calculateBookValue(asset);
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Aktiva Tetap</h2>
                    <p className="text-sm text-muted-foreground">Fixed assets & depreciation</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchAssets()} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
                        Refresh
                    </Button>
                    <Button variant="default" onClick={handleBatchDepreciation}
                            disabled={isLoading || isCalculatingDepreciation}>
                        <Calculator className={`h-4 w-4 mr-2 ${isCalculatingDepreciation ? 'animate-spin' : ''}`}/>
                        {isCalculatingDepreciation ? 'Menghitung...' : 'Hitung Semua'}
                    </Button>
                    <Button onClick={() => setFormModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Harga Perolehan</p>
                        <p className="text-xl font-bold">{formatCurrency(summary.total_cost)}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Akumulasi Penyusutan</p>
                        <p className="text-xl font-bold text-orange-600">({formatCurrency(summary.total_accumulated)})</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Nilai Buku</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(summary.total_book_value)}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Cari aset..."
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    className="max-w-xs"
                />
                <Select
                    value={filters.status || 'all'}
                    onValueChange={v => v && handleStatusChange(v)}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="disposed">Dilepaskan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Kode</th>
                        <th className="px-4 py-3 text-left font-medium">Nama Aset</th>
                        <th className="px-4 py-3 text-left font-medium">Kategori</th>
                        <th className="px-4 py-3 text-left font-medium">Tgl Perolehan</th>
                        <th className="px-4 py-3 text-right font-medium">Harga Perolehan</th>
                        <th className="px-4 py-3 text-right font-medium">Akumulasi Penyusutan</th>
                        <th className="px-4 py-3 text-right font-medium">Nilai Buku</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                Memuat...
                            </td>
                        </tr>
                    ) : filteredAssets.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                Tidak ada data aktiva tetap
                            </td>
                        </tr>
                    ) : (
                        filteredAssets.map(asset => {
                            const displayAccumulated = getAssetDisplayDepreciation(asset)
                            const displayBookValue = getAssetDisplayBookValue(asset)
                            return (
                                <tr key={asset.id} className="border-b hover:bg-muted/50">
                                    <td className="px-4 py-3 font-mono text-xs">{asset.code}</td>
                                    <td className="px-4 py-3 font-medium">{asset.name}</td>
                                    <td className="px-4 py-3">{asset.category}</td>
                                    <td className="px-4 py-3">{formatDate(asset.acquisition_date)}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.acquisition_cost)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-orange-600">
                                        ({formatCurrency(displayAccumulated)})
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-medium text-green-600">
                                        {formatCurrency(displayBookValue)}
                                    </td>
                                    <td className="px-4 py-3 text-center">{getStatusBadge(asset.status)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {asset.status === 'active' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewHistory(asset)}
                                                        title="Riwayat Penyusutan"
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <History className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(asset)}
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDispose(asset)}
                                                        title="Lepaskan"
                                                        className="text-orange-600 hover:text-orange-700"
                                                    >
                                                        <TrendingDown className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(asset)}
                                                        title="Hapus"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* Depreciation Info */}
            <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4"/>
                    Metode Penyusutan
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>
                        <strong>Garis Lurus (Straight Line):</strong> (Harga Perolehan - Nilai Sisa) / Umur Ekonomis
                    </li>
                    <li>
                        <strong>Saldo Menurun (Declining Balance):</strong> Nilai Buku x (2 / Umur Ekonomis)
                    </li>
                    <li>
                        <strong>Jumlah Angka Tahun (Sum of Years):</strong> (Sisa Umur / Jumlah Angka Tahun) x (Harga
                        Perolehan - Nilai Sisa)
                    </li>
                </ul>
            </div>

            {/* Modals */}
            <FixedAssetFormModal
                open={formModalOpen}
                onClose={handleFormClose}
                editAsset={selectedAsset}
            />

            {selectedAsset && (
                <DisposeAssetModal
                    open={disposeModalOpen}
                    onClose={handleDisposeClose}
                    asset={selectedAsset}
                />
            )}

            {/* Batch Result Display */}
            {batchResult && (
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-green-700">✓ {batchResult.message}</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleBatchResultClose}>✕</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">Aset Diproses</p>
                            <p className="text-xl font-bold">{batchResult.assets_processed}</p>
                        </div>
                        <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">Total Penyusutan</p>
                            <p className="text-xl font-bold text-orange-600">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(batchResult.total_depreciation)}
                            </p>
                        </div>
                    </div>

                    {batchResult.fully_depreciated?.length > 0 && (
                        <div className="border rounded-lg p-3">
                            <p className="text-sm font-medium mb-2">Sudah Fully Depreciated:</p>
                            <ul className="text-sm space-y-1">
                                {batchResult.fully_depreciated.map((a: any, i: number) => (
                                    <li key={i} className="text-muted-foreground">
                                        • {a.code} - {a.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {batchResult.asset_details?.length > 0 && (
                        <div className="border rounded-lg p-3 mt-4">
                            <p className="text-sm font-medium mb-2">Detail per Aset:</p>
                            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                                {batchResult.asset_details.map((a: any, i: number) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{a.code} - {a.name}</span>
                                        <span className="text-muted-foreground">
                                            {a.months_posted} bulan = {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            maximumFractionDigits: 0,
                                        }).format(a.total_depreciation)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Depreciation History Modal */}
            {selectedAsset && (
                <DepreciationHistoryModal
                    open={historyModalOpen}
                    onClose={() => {
                        setHistoryModalOpen(false)
                        setSelectedAsset(null)
                    }}
                    asset={selectedAsset}
                />
            )}
        </div>
    )
}
