/**
 * Accounts Filters Component
 * Search and type dropdown controls
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccountsStore } from '../store/accounts-store'
import type { AccountType } from '../types/accounts.types'

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
      <Select
        value={filters.type ?? 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            setFilters({ type: undefined })
          } else {
            setFilters({ type: value as AccountType })
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="asset">Asset (Aktiva)</SelectItem>
          <SelectItem value="liability">Liability (Kewajiban)</SelectItem>
          <SelectItem value="equity">Equity (Modal)</SelectItem>
          <SelectItem value="revenue">Revenue (Pendapatan)</SelectItem>
          <SelectItem value="expense">Expense (Beban)</SelectItem>
        </SelectContent>
      </Select>

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
