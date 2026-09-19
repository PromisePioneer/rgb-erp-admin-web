/**
 * Stock Opname Form Component
 * Workflow: select warehouse -> view positions -> edit actual qty -> submit
 */
import { useCallback, useState } from 'react'
import { Save, RotateCcw, Package, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useStockOpnameStore } from '../store/stock-opnames-store'
import { warehousesApi } from '@/features/warehouses/api/warehouses-api'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function StockOpnameForm() {
  const {
    lineItems,
    selectedWarehouseId,
    selectedWarehouseName,
    opnameDate,
    isLoadingPositions,
    isSubmitting,
    fetchPositions,
    setLineItemActualQty,
    setOpnameDate,
    resetPositions,
    submitOpname,
  } = useStockOpnameStore()

  const [localWarehouseId, setLocalWarehouseId] = useState<number | null>(null)

  // Calculate totals
  const totalGain = lineItems
    .filter(item => item.variance > 0)
    .reduce((sum, item) => sum + item.variance_value, 0)

  const totalLoss = lineItems
    .filter(item => item.variance < 0)
    .reduce((sum, item) => sum + Math.abs(item.variance_value), 0)

  const itemCount = lineItems.filter(item => item.variance !== 0).length

  // Load warehouses
  const loadWarehouses = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await warehousesApi.getSelectOptions({ q: search })
      return response.data.map((w) => ({
        value: w.id,
        label: w.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Handle warehouse selection
  const handleWarehouseChange = (value: number | string | null) => {
    if (!value) {
      setLocalWarehouseId(null)
      return
    }
    const warehouseId = Number(value)
    setLocalWarehouseId(warehouseId)
    fetchPositions(warehouseId)
  }

  // Handle actual qty change
  const handleActualQtyChange = (productId: number, value: string) => {
    const qty = parseFloat(value) || 0
    setLineItemActualQty(productId, qty)
  }

  // Handle reset
  const handleReset = () => {
    if (selectedWarehouseId) {
      fetchPositions(selectedWarehouseId)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const result = await submitOpname()
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="opname" className="w-full">
        <TabsList>
          <TabsTrigger value="opname">Stock Opname</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="opname" className="space-y-6">
          {/* Warehouse Selection */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pilih Gudang
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gudang *</label>
                <AsyncSelect
                  value={localWarehouseId ?? null}
                  onChange={handleWarehouseChange}
                  loadOptions={loadWarehouses}
                  placeholder="Pilih gudang..."
                  isDisabled={isLoadingPositions || isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Opname *</label>
                <Input
                  type="date"
                  value={opnameDate}
                  onChange={(e) => setOpnameDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          {selectedWarehouseId && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total Produk</p>
                  <p className="text-xl font-bold">{lineItems.length}</p>
                </div>
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <p className="text-sm text-yellow-600">Ada Perubahan</p>
                  <p className="text-xl font-bold text-yellow-600">{itemCount}</p>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <p className="text-sm text-green-600">Selisih Positif</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalGain)}</p>
                </div>
                <div className="border rounded-lg p-4 bg-red-50">
                  <p className="text-sm text-red-600">Selisih Negatif</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalLoss)}</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                  <div>
                    <h3 className="font-semibold">Daftar Stok Gudang: {selectedWarehouseName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit kolom "Stok Sesungguhnya" untuk mencatat hasil stock opname
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset ke Sistem
                  </Button>
                </div>

                {isLoadingPositions ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Memuat data stok...
                  </div>
                ) : lineItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mb-3 opacity-50" />
                    <p>Tidak ada data stok untuk gudang ini</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium w-12">#</th>
                          <th className="px-3 py-2 text-left font-medium">Produk</th>
                          <th className="px-3 py-2 text-right font-medium">Stok Sistem</th>
                          <th className="px-3 py-2 text-right font-medium">Stok Sesungguhnya</th>
                          <th className="px-3 py-2 text-right font-medium">Selisih</th>
                          <th className="px-3 py-2 text-right font-medium">Nilai Selisih</th>
                          <th className="px-3 py-2 text-center font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={item.product_id} className="border-t">
                            <td className="px-3 py-2 text-center text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.product_code} • {item.category || '-'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {item.system_qty.toLocaleString('id-ID')} {item.unit}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.actual_qty}
                                onChange={(e) => handleActualQtyChange(item.product_id, e.target.value)}
                                className="text-right w-28"
                                disabled={isSubmitting}
                              />
                            </td>
                            <td className={`px-3 py-2 text-right font-mono ${
                              item.variance > 0 ? 'text-green-600' :
                              item.variance < 0 ? 'text-red-600' : ''
                            }`}>
                              {item.variance > 0 ? '+' : ''}{item.variance.toLocaleString('id-ID')} {item.unit}
                            </td>
                            <td className={`px-3 py-2 text-right font-mono ${
                              item.variance_value > 0 ? 'text-green-600' :
                              item.variance_value < 0 ? 'text-red-600' : ''
                            }`}>
                              {item.variance_value > 0 ? '+' : ''}{formatCurrency(item.variance_value)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {item.variance === 0 ? (
                                <span className="text-muted-foreground">-</span>
                              ) : item.variance > 0 ? (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Lebih
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600">
                                  <AlertCircle className="h-4 w-4" />
                                  Kurang
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetPositions}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || itemCount === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Stock Opname'}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground text-center py-8">
              Riwayat stock opname akan ditampilkan di sini
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
