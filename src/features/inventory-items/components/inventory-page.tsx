/**
 * Inventory Items Page
 * QR Code tracking and stock movement
 */
import { useEffect } from 'react'
import { Package, FlaskConical, Wrench } from 'lucide-react'
import { useInventoryStore } from '../store/inventory-items-store'
import { InventoryTable } from './inventory-table'

// Check if category is chemical
function isChemicalCategory(categoryName: string): boolean {
  const cat = categoryName.toLowerCase()
  return cat.includes('chemical') || cat.includes('kimia')
}

export function InventoryPage() {
  const { summary, fetchSummary } = useInventoryStore()

  useEffect(() => {
    fetchSummary()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory Tracking
        </h1>
        <p className="text-muted-foreground">
          Tracking barcode untuk stock movement barang
        </p>
      </div>

      {/* Condition Cards - Category based */}
      {summary && summary.category_breakdown && summary.category_breakdown.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-muted-foreground">Kondisi per Kategori</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {summary.category_breakdown.map((cat, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${cat.condition_color}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {isChemicalCategory(cat.category_name) ? (
                      <FlaskConical className="h-5 w-5 opacity-70" />
                    ) : (
                      <Wrench className="h-5 w-5 opacity-70" />
                    )}
                    <span className="font-medium text-sm">{cat.category_name}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/50`}>
                    {cat.condition_label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{cat.total_stock} unit</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: cat.percentage >= 80 ? '#22c55e' : cat.percentage >= 50 ? '#10b981' : cat.percentage >= 30 ? '#eab308' : cat.percentage >= 10 ? '#f97316' : '#ef4444'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 opacity-70">
                    dari {cat.initial_stock} unit awal
                  </p>
                </div>

                <div className="mt-2 text-xs opacity-70">
                  {cat.total_items} item(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Daftar Items</h2>
        <InventoryTable />
      </div>
    </div>
  )
}
