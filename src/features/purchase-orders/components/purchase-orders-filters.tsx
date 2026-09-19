/**
 * Purchase Orders Filters Component
 * Search controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePurchaseOrdersStore } from '../store/purchase-orders-store'

export function PurchaseOrdersFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = usePurchaseOrdersStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by code, supplier, or PR code..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[300px]"
      />

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
