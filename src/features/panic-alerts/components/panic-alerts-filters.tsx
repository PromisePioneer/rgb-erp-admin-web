/**
 * Panic Alerts Filters Component
 */
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePanicAlertsStore } from '../store/panic-alerts-store'

export function PanicAlertsFilters() {
  const { filters, setFilters, resetFilters } = usePanicAlertsStore()

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employee, client, area..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>
      {(filters.search) && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear
        </Button>
      )}
    </div>
  )
}
