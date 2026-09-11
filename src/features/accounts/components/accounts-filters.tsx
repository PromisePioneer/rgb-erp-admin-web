/**
 * Accounts Filters Component
 * Search and type dropdown controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSelect } from '@/components/async-select'
import { useAccountsStore } from '../store/accounts-store'
import type { AccountType } from '../types/accounts.types'

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset (Aktiva)' },
  { value: 'liability', label: 'Liability (Kewajiban)' },
  { value: 'equity', label: 'Equity (Modal)' },
  { value: 'revenue', label: 'Revenue (Pendapatan)' },
  { value: 'expense', label: 'Expense (Beban)' },
]

export function AccountsFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
  } = useAccountsStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.type

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input - auto search on type */}
      <Input
        placeholder="Search by code or name..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Type Dropdown */}
      <AsyncSelect
        placeholder="All Types"
        loadOptions={async () => ACCOUNT_TYPES}
        value={filters.type || null}
        onChange={(val) => setFilters({ type: val as AccountType || undefined })}
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
