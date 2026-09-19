/**
 * Barcode Scanner Component
 * Quick scan and lookup for inventory items
 */
import { useState } from 'react'
import { Search, Package, MapPin, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useInventoryStore } from '@/features/inventory-items'

export function BarcodeScanner() {
  const { scannedItem, scanBarcode, isLoading, error, clearScannedItem, clearError } = useInventoryStore()
  const [barcodeInput, setBarcodeInput] = useState('')

  const handleScan = async () => {
    if (!barcodeInput.trim()) return
    clearError()
    await scanBarcode(barcodeInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Scan atau ketik barcode..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 font-mono"
          />
        </div>
        <Button onClick={handleScan} disabled={isLoading || !barcodeInput.trim()}>
          {isLoading ? 'Scanning...' : 'Scan'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Scanned Item Result */}
      {scannedItem && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              {scannedItem.product_name}
            </h3>
            <code className="text-sm text-muted-foreground">#{scannedItem.id}</code>
          </div>

          <div className="p-4 space-y-3">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scannedItem.status_color}`}>
                {scannedItem.status_label}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              {scannedItem.current_location_type === 'warehouse' && (
                <>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Gudang:</span>
                  <span>{scannedItem.warehouse_name}</span>
                </>
              )}
              {scannedItem.current_location_type === 'area' && (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Area:</span>
                  <span>Area #{scannedItem.current_location_id}</span>
                </>
              )}
              {scannedItem.current_location_type === 'employee' && (
                <>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Employee:</span>
                  <span>ID #{scannedItem.current_location_id}</span>
                </>
              )}
            </div>

            {/* Purchase Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Harga Beli</span>
              <span>Rp {scannedItem.purchase_price.toLocaleString('id-ID')}</span>
            </div>

            {scannedItem.purchase_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tanggal Beli</span>
                <span>{new Date(scannedItem.purchase_date).toLocaleDateString('id-ID')}</span>
              </div>
            )}

            {/* Notes */}
            {scannedItem.notes && (
              <div className="pt-2 border-t text-sm">
                <span className="text-muted-foreground">Catatan:</span>
                <p className="mt-1">{scannedItem.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-muted/30 border-t flex gap-2">
            <Button variant="outline" size="sm" onClick={clearScannedItem}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
