"use client"
import { useEffect, useState } from 'react'
import { RefreshCw, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStockCardStore } from '../store/stock-card-store'

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

export function StockCardTable() {
  const { data, products, warehouses, isLoadingData, fetchProducts, fetchWarehouses, setFilters } = useStockCardStore()
  const [productId, setProductId] = useState<string>('')
  const [warehouseId, setWarehouseId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchWarehouses()
  }, [fetchProducts, fetchWarehouses])

  const handleSearch = () => {
    if (!productId || !warehouseId) return
    setFilters({
      product_id: Number(productId),
      warehouse_id: Number(warehouseId),
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    })
  }

  const handleProductChange = (value: string) => {
    setProductId(value)
  }

  const handleWarehouseChange = (value: string) => {
    setWarehouseId(value)
  }

  const safeProducts = Array.isArray(products) ? products : []
  const safeWarehouses = Array.isArray(warehouses) ? warehouses : []
  const safeData = data
  const safeMovements = safeData?.movements || []

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Pembelian',
      sale: 'Penjualan',
      adjustment: 'Penyesuaian',
      transfer_in: 'Transfer Masuk',
      transfer_out: 'Transfer Keluar',
      return_in: 'Retur Masuk',
      return_out: 'Retur Keluar',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: 'bg-green-100 text-green-700',
      sale: 'bg-red-100 text-red-700',
      adjustment: 'bg-blue-100 text-blue-700',
      transfer_in: 'bg-purple-100 text-purple-700',
      transfer_out: 'bg-orange-100 text-orange-700',
      return_in: 'bg-cyan-100 text-cyan-700',
      return_out: 'bg-yellow-100 text-yellow-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  // Calculate totals
  const totalIn = safeMovements.filter((m: any) => m.qty > 0).reduce((s: number, m: any) => s + (m.qty || 0), 0)
  const totalOut = Math.abs(safeMovements.filter((m: any) => m.qty < 0).reduce((s: number, m: any) => s + (m.qty || 0), 0))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Kartu Stok</h2>
          <p className="text-sm text-muted-foreground">Stock movements FIFO / Average</p>
        </div>
        {safeData && (
          <Button variant="outline" onClick={handleSearch} disabled={isLoadingData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Produk</Label>
          <Select value={productId} onValueChange={v => v && handleProductChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih produk" />
            </SelectTrigger>
            <SelectContent>
              {safeProducts.map((p: any) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.code} - {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Gudang</Label>
          <Select value={warehouseId} onValueChange={v => v && handleWarehouseChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih gudang" />
            </SelectTrigger>
            <SelectContent>
              {safeWarehouses.map((w: any) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tanggal Mulai</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tanggal Selesai</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSearch} disabled={!productId || !warehouseId || isLoadingData}>
          <Package className="h-4 w-4 mr-2" />
          Tampilkan Kartu Stok
        </Button>
      </div>

      {!safeData && !isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mb-4" />
          <p>Pilih produk dan gudang untuk melihat kartu stok</p>
        </div>
      ) : isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          Memuat...
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Saldo Awal</p>
              <p className="text-xl font-bold">{safeData?.beginning_qty || 0} {safeData?.product?.unit || ''}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(safeData?.beginning_value || 0)}</p>
            </div>
            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="text-sm text-blue-600">Masuk</p>
              <p className="text-xl font-bold text-blue-600">{totalIn} {safeData?.product?.unit || ''}</p>
            </div>
            <div className="border rounded-lg p-4 bg-red-50">
              <p className="text-sm text-red-600">Keluar</p>
              <p className="text-xl font-bold text-red-600">{totalOut} {safeData?.product?.unit || ''}</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="text-sm text-green-600">Saldo Akhir</p>
              <p className="text-xl font-bold text-green-600">{safeData?.ending_qty || 0} {safeData?.product?.unit || ''}</p>
              <p className="text-sm text-green-600">@{formatCurrency(safeData?.avg_cost || 0)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Jenis</th>
                  <th className="px-4 py-3 text-left font-medium">Keterangan</th>
                  <th className="px-4 py-3 text-right font-medium">Qty Masuk</th>
                  <th className="px-4 py-3 text-right font-medium">Qty Keluar</th>
                  <th className="px-4 py-3 text-right font-medium">Harga</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Beginning Balance */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2">Saldo Awal</td>
                  <td className="px-4 py-2">Saldo Awal Periode</td>
                  <td className="px-4 py-2 text-right font-mono">{safeData?.beginning_qty || 0}</td>
                  <td className="px-4 py-2 text-right font-mono">-</td>
                  <td className="px-4 py-2 text-right font-mono">-</td>
                  <td className="px-4 py-2 text-right font-mono">{safeData?.beginning_qty || 0}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(safeData?.beginning_value || 0)}</td>
                </tr>
                {safeMovements.map((movement: any) => (
                  <tr key={movement.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{formatDate(movement.date)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(movement.type)}`}>
                        {getTypeLabel(movement.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {movement.description}
                      {movement.reference && <span className="text-muted-foreground ml-1">({movement.reference})</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-green-600">
                      {movement.qty > 0 ? movement.qty : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-red-600">
                      {movement.qty < 0 ? Math.abs(movement.qty) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {movement.unit_cost > 0 ? formatCurrency(movement.unit_cost) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{movement.balance_qty || 0}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(movement.balance_value || 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 font-semibold">
                <tr>
                  <td colSpan={3} className="px-4 py-3">SALDO AKHIR</td>
                  <td />
                  <td />
                  <td />
                  <td className="px-4 py-3 text-right font-mono">{safeData?.ending_qty || 0}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(safeData?.ending_value || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
