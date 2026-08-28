/**
 * Clients Filters Component
 * Search and client type dropdown controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useClientsStore } from '../store/clients-store'
import { clientTypesApi } from '@/features/client-types/api/client-types-api'

export function ClientsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useClientsStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleClientTypeChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ client_type_id: undefined })
    } else {
      setFilters({ client_type_id: Number(value) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.client_type_id

  // Load client types
  const loadClientTypes = async (search: string): Promise<SelectOption[]> => {
    const response = await clientTypesApi.getSelectOptions({ q: search })
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

      {/* Client Type Dropdown - Async Select */}
      <AsyncSelect
        value={filters.client_type_id ?? null}
        onChange={handleClientTypeChange}
        loadOptions={loadClientTypes}
        placeholder="All Client Types"
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
