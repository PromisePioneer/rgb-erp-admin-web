/**
 * Employees Filters Component
 * Search, client, area, and backoffice filters with AsyncSelect
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { clientsApi } from '@/features/clients/api/clients-api'
import { areasApi } from '@/features/areas/api/areas-api'
import { useEmployeesStore } from '../store/employees-store'

export function EmployeesFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useEmployeesStore()

  const [selectedClient, setSelectedClient] = useState<SelectOption | null>(null)
  const [selectedArea, setSelectedArea] = useState<SelectOption | null>(null)
  const [isBackoffice, setIsBackoffice] = useState(false)

  // Load clients for dropdown
  const loadClients = async (search: string): Promise<SelectOption[]> => {
    const response = await clientsApi.getSelectOptions({ q: search })
    return response.data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  // Load areas for dropdown (filtered by client if selected)
  const loadAreas = async (search: string): Promise<SelectOption[]> => {
    const params: Record<string, any> = { q: search }
    if (selectedClient?.value) {
      params.client_id = selectedClient.value
    }
    const response = await areasApi.getSelectOptions(params)
    return response.data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  // Handle client change
  const handleClientChange = (value: number | string | null) => {
    const option = value ? { value, label: '' } : null
    setSelectedClient(option)
    // Reset area when client changes
    setSelectedArea(null)
    setFilters({ client_id: value as number | undefined, area_id: undefined })
  }

  // Handle area change
  const handleAreaChange = (value: number | string | null) => {
    const option = value ? { value, label: '' } : null
    setSelectedArea(option)
    setFilters({ area_id: value as number | undefined })
  }

  // Handle backoffice toggle
  const handleBackofficeToggle = () => {
    const newValue = !isBackoffice
    setIsBackoffice(newValue)
    setFilters({ backoffice: newValue || undefined })
    // Clear client/area filters when backoffice is selected
    if (newValue) {
      setSelectedClient(null)
      setSelectedArea(null)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleReset = () => {
    resetFilters()
    setSelectedClient(null)
    setSelectedArea(null)
    setIsBackoffice(false)
  }

  const hasActiveFilters = filters.search || filters.client_id || filters.area_id || filters.backoffice

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Search by name, code, or phone..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[180px]"
      />

      {/* Client Filter */}
      <div className="w-[180px]">
        <AsyncSelect
          placeholder="Filter by Client"
          loadOptions={loadClients}
          value={selectedClient?.value}
          onChange={handleClientChange}
        />
      </div>

      {/* Area Filter */}
      <div className="w-[180px]">
        <AsyncSelect
          placeholder="Filter by Area"
          loadOptions={loadAreas}
          value={selectedArea?.value}
          onChange={handleAreaChange}
        />
      </div>

      {/* Backoffice Toggle */}
      <Button
        type="button"
        variant={isBackoffice ? 'default' : 'outline'}
        size="sm"
        onClick={handleBackofficeToggle}
        className={isBackoffice ? '' : 'border-blue-200 text-blue-600 hover:text-blue-700'}
      >
        Backoffice Only
      </Button>

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
