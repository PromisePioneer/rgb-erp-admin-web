/**
 * Products Filters Component
 * Search and category dropdown controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useProductsStore } from '../store/products-store'
import { productCategoriesApi } from '@/features/product-categories/api/product-categories-api'

export function ProductsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useProductsStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleCategoryChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ category_id: undefined })
    } else {
      setFilters({ category_id: Number(value) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.category_id

  // Load product categories
  const loadCategories = async (search: string): Promise<SelectOption[]> => {
    const response = await productCategoriesApi.getSelectOptions({ q: search })
    return response.data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by name..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Category Dropdown - Async Select */}
      <AsyncSelect
        value={filters.category_id ?? null}
        onChange={handleCategoryChange}
        loadOptions={loadCategories}
        placeholder="All Categories"
        className="w-[200px]"
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
