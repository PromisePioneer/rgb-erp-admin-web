/**
 * Inventory Items Page
 * QR Code tracking and stock movement
 */
import { useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, CheckCircle, FlaskConical, Wrench } from 'lucide-react'
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

      {/* Summary Cards - Status based */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Package className="h-4 w-4" />
              Total Items
            </div>
            <p className="text-2xl font-bold mt-1">{summary.total}</p>
          </div>
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Tersedia
            </div>
            <p className="text-2xl font-bold mt-1 text-green-700">{summary.available}</p>
          </div>
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Ditugaskan
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-700">{summary.assigned}</p>
          </div>
          <div className="border rounded-lg p-4 bg-orange-50">
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Rusak/Hilang
            </div>
            <p className="text-2xl font-bold mt-1 text-orange-700">
              {summary.damaged + summary.lost}
            </p>
          </div>
        </div>
      )}

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
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{cat.total_items}</p>
                  <p className="text-xs opacity-80">items</p>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.condition_color}`}>
                    {cat.condition_label}
                  </span>
                </div>
                <div className="mt-2 text-xs opacity-70">
                  {isChemicalCategory(cat.category_name) ? (
                    <span>Chemical Condition</span>
                  ) : (
                    <span>Tools/PPE Condition</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Legenda:</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                <span>Chemical: Penuh (≥75) / Setengah (≥30) / Habis (&lt;30)</span>
              </div>
              <div className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                <span>Tools: Sangat Baik (≥80) / Baik (≥50) / Cukup (≥30) / Kurang (≥10) / Ganti (&lt;10)</span>
              </div>
            </div>
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
