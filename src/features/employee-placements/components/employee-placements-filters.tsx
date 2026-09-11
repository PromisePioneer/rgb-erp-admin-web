/**
 * Employee Placements Filters Component
 * Search and status filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect } from '@/components/async-select'
import { useEmployeePlacementsStore } from '@/features/employee-placements'

const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export function EmployeePlacementsFilters() {
    const {
        filters,
        setFilters,
        resetFilters,
    } = useEmployeePlacementsStore()

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ search: e.target.value || undefined })
    }

    const handleStatusChange = (value: string | number | null) => {
        if (!value) {
            setFilters({ status: undefined })
        } else {
            setFilters({ status: String(value) })
        }
    }

    const handleReset = () => {
        resetFilters()
    }

    const hasActiveFilters = filters.search || filters.status

    return (
        <div className="flex flex-wrap gap-3 items-end">
            {/* Search Input - auto search on type */}
            <Input
                placeholder="Search by name..."
                value={filters.search ?? ''}
                onChange={handleSearchChange}
                className="w-[250px]"
            />

            {/* Status Dropdown */}
            <AsyncSelect
                placeholder="All Status"
                loadOptions={async () => STATUS_OPTIONS}
                value={filters.status ? String(filters.status) : null}
                onChange={handleStatusChange}
                className="w-[150px]"
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
