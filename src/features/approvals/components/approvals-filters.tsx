/**
 * Approvals Filters Component
 */
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useApprovalsStore } from '../store/approvals-store'

export function ApprovalsFilters() {
  const { filters, setFilters, resetFilters } = useApprovalsStore()

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requester name..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>
      {filters.search && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  )
}
