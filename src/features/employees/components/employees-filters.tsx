/**
 * Employees Filters Component
 * Search controls with company dropdown
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useEmployeesStore } from '../store/employees-store'
import { companyApi } from '@/features/companies/api/companies-api'

export function EmployeesFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useEmployeesStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleCompanyChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ company_id: undefined })
    } else {
      setFilters({ company_id: Number(value) })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.company_id

  // Load companies for dropdown
  const loadCompanies = async (search: string): Promise<SelectOption[]> => {
    const response = await companyApi.getSelectOptions({ q: search })
    return response.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by name, code, or phone..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[280px]"
      />

      {/* Company Dropdown - Async Select */}
      <AsyncSelect
        value={filters.company_id ?? null}
        onChange={handleCompanyChange}
        loadOptions={loadCompanies}
        placeholder="All Companies"
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
