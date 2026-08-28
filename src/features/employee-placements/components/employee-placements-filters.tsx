/**
 * Employee Placements Filters Component
 * Search and status filter controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEmployeePlacementsStore } from '@/features/employee-placements'

export function EmployeePlacementsFilters() {
    const {
        filters,
        setFilters,
        resetFilters,
    } = useEmployeePlacementsStore()

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ search: e.target.value || undefined })
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (!value || value === 'all') {
            setFilters({ status: undefined })
        } else {
            setFilters({ status: value })
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
            <select
                value={filters.status ?? ''}
                onChange={handleStatusChange}
                className="flex h-10 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
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
