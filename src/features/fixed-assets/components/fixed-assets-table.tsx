"use client"
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'

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

interface FixedAsset {
  id: number
  code: string
  name: string
  category_name: string
  purchase_date: string
  purchase_cost: number
  salvage_value: number
  useful_life_years: number
  depreciation_method: string
  accumulated_depreciation: number
  book_value: number
  status: 'active' | 'disposed' | 'sold'
}

interface FixedAssetsData {
  assets: FixedAsset[]
  summary: {
    total_cost: number
    total_accumulated: number
    total_book_value: number
  }
}

export function FixedAssetsTable() {
  const [data, setData] = useState<FixedAssetsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [search, setSearch] = useState('')

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const { data: res } = await apiClient.get(`/admin/fixed-assets?${params}`)
      setData(res.data)
    } catch (e) {
      console.error('Failed to fetch assets:', e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { fetchAssets() }, [fetchAssets])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Aktiva Tetap</h2>
          <p className="text-sm text-muted-foreground">Fixed assets & depreciation</p>
        </div>
        <Button variant="outline" onClick={fetchAssets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Total Harga Perolehan</p>
            {/*<p className="text-xl font-bold text-blue-700">{formatCurrency(data.summary.total_cost)}</p>*/}
          </div>
          <div className="border rounded-lg p-4 bg-orange-50">
            <p className="text-sm text-orange-600">Total Akumulasi Penyusutan</p>
            <p className="text-xl font-bold text-orange-700">{formatCurrency(data.summary.total_accumulated)}</p>
          </div>
          <div className="border rounded-lg p-4 bg-green-50">
            <p className="text-sm text-green-600">Total Nilai Buku</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(data.summary.total_book_value)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Cari aset..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
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
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : !data || data.assets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data aktiva tetap
                </td>
              </tr>
            ) : (
              data.assets.map(asset => (
                <tr key={asset.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">{asset.code}</td>
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3">{asset.category_name}</td>
                  <td className="px-4 py-3">{formatDate(asset.purchase_date)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.purchase_cost)}</td>
                  <td className="px-4 py-3 text-right font-mono text-orange-600">
                    ({formatCurrency(asset.accumulated_depreciation)})
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-green-600">
                    {formatCurrency(asset.book_value)}
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
