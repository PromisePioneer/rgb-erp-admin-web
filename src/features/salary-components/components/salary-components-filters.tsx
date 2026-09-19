/**
 * Salary Components Filters Component
 * Search controls with AsyncSelect for client filter
 */
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useSalaryComponentsStore } from '../store/salary-components-store'
import { clientsApi } from '@/features/clients/api/clients-api'
import { useCallback } from 'react'

export function SalaryComponentsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useSalaryComponentsStore()

  // Load client options for AsyncSelect
  const loadClientOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await clientsApi.getSelectOptions({ q: search })
      return response.data.map((client) => ({
        value: client.id,
        label: client.name,
      }))
    } catch {
      return []
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) {
      setFilters({ type: undefined })
    } else {
      setFilters({ type: value as 'earning' | 'deduction' })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.type || filters.client_id

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name..."
          value={filters.search ?? ''}
          onChange={handleSearchChange}
          className="w-[200px] pl-9"
        />
      </div>

      {/* Client Filter - AsyncSelect */}
      <div className="w-[220px]">
        <AsyncSelect
          value={filters.client_id || null}
          onChange={(value) => {
            setFilters({ client_id: value ? Number(value) : undefined })
          }}
          loadOptions={loadClientOptions}
          placeholder="Filter by Client..."
          label=""
          defaultOptions={true}
        />
      </div>

      {/* Type Filter */}
      <select
        value={filters.type ?? ''}
        onChange={handleTypeChange}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[140px]"
      >
        <option value="">All Types</option>
        <option value="earning">Earning</option>
        <option value="deduction">Deduction</option>
      </select>

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
