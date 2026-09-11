/**
 * Face Enrollments Filters Component
 * Search and employee dropdown controls
 */
import { useCallback, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { faceEnrollmentsApi } from '../api/face-enrollments-api'
import { useFaceEnrollmentsStore } from '../store/face-enrollments-store'

export function FaceEnrollmentsFilters() {
  const { filters, setFilters, resetFilters } = useFaceEnrollmentsStore()
  const [searchQuery, setSearchQuery] = useState(filters.search || '')

  const hasActiveFilters = filters.search || filters.employee_id

  // Load employees for dropdown
  const loadEmployees = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await faceEnrollmentsApi.getEmployees({ q: search })
      return response.data.map((emp) => ({
        value: emp.id,
        label: emp.name + (emp.code ? ` (${emp.code})` : ''),
      }))
    } catch {
      return []
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchQuery || undefined })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setFilters({ search: searchQuery || undefined })
    }
  }

  const handleEmployeeChange = (value: number | string | null) => {
    setFilters({ employee_id: value ? Number(value) : undefined })
  }

  const handleReset = () => {
    setSearchQuery('')
    resetFilters()
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employee..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setFilters({ search: undefined })
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Employee Filter */}
      <div className="w-[250px]">
        <AsyncSelect
          value={filters.employee_id ?? null}
          onChange={handleEmployeeChange}
          loadOptions={loadEmployees}
          placeholder="Filter by employee..."
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  )
}
