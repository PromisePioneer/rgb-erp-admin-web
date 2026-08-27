"use client"
import { useEffect, useState } from 'react'
import { RefreshCw, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFixedAssetsStore } from '../store/fixed-assets-store'

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
  const { assets, summary, isLoading, fetchAssets, setFilters, filters } = useFixedAssetsStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilters({ ...filters, search: value })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-700">Aktif</Badge>
      case 'disposed':
        return <Badge variant="secondary">Dibuang</Badge>
      case 'sold':
        return <Badge variant="outline">Terjual</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Safe access to summary
  const safeSummary = summary || { total_cost: 0, total_accumulated: 0, total_book_value: 0 }
  const safeAssets = Array.isArray(assets) ? assets : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Aktiva Tetap</h2>
          <p className="text-sm text-muted-foreground">Fixed assets & depreciation</p>
        </div>
        <Button variant="outline" onClick={() => fetchAssets()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Total Harga Perolehan</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(safeSummary.total_cost)}</p>
          </div>
          <div className="border rounded-lg p-4 bg-orange-50">
            <p className="text-sm text-orange-600">Total Akumulasi Penyusutan</p>
            <p className="text-xl font-bold text-orange-700">{formatCurrency(safeSummary.total_accumulated)}</p>
          </div>
          <div className="border rounded-lg p-4 bg-green-50">
            <p className="text-sm text-green-600">Total Nilai Buku</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(safeSummary.total_book_value)}</p>
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
        <Select value={filters.status || 'all'} onValueChange={v => v && handleStatusChange(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="disposed">Dibuang</SelectItem>
            <SelectItem value="sold">Terjual</SelectItem>
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
              <th className="px-4 py-3 text-right font-medium">Penyusutan</th>
              <th className="px-4 py-3 text-right font-medium">Nilai Buku</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : safeAssets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data aktiva tetap
                </td>
              </tr>
            ) : (
              safeAssets.map(asset => (
                <tr key={asset.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">{asset.code}</td>
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3">{asset.category_name}</td>
                  <td className="px-4 py-3">{formatDate(asset.purchase_date)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.purchase_cost || 0)}</td>
                  <td className="px-4 py-3 text-right font-mono text-orange-600">
                    ({formatCurrency(asset.accumulated_depreciation || 0)})
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-green-600">
                    {formatCurrency(asset.book_value || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(asset.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Depreciation Info */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Metode Penyusutan
        </h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li><strong>Garis Lurus (Straight Line):</strong> (Harga Perolehan - Nilai Sisa) / Umur Economis</li>
          <li><strong>Saldo Menurun (Declining Balance):</strong> Tarif % x Nilai Buku Awal Tahun</li>
          <li><strong>Jumlah Angka Tahun (Sum of Years):</strong> Sisa Umur / Jumlah Angka Tahun x (Harga Perolehan - Nilai Sisa)</li>
        </ul>
      </div>
    </div>
  )
}
