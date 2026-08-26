/**
 * Bank Accounts Filters Component
 * Search and filter bar for bank accounts
 */
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useBankAccountsStore } from '../store/bank-accounts-store'

export function BankAccountsFilters() {
  const { filters, setFilters, resetFilters } = useBankAccountsStore()

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bank accounts..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>
      {(filters.search) && (
        <button
          onClick={resetFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
