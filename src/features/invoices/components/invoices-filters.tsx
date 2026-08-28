/**
 * Invoices Filters Component
 * Search and filter bar for invoices
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
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { useInvoicesStore } from '../store/invoices-store'
import { invoicesApi } from '../api/invoices-api'

export function InvoicesFilters() {
  const { filters, setFilters, resetFilters } = useInvoicesStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value || undefined })
  }

  const handleClientChange = (value: number | string | null) => {
    if (!value) {
      setFilters({ client_id: undefined })
    } else {
      setFilters({ client_id: Number(value) })
    }
  }

  const handleStatusChange = (value: string | null) => {
    if (!value || value === 'all') {
      setFilters({ status: undefined })
    } else {
      setFilters({ status: value })
    }
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters = filters.search || filters.client_id || filters.status

  // Load clients for filter
  const loadClients = async (search: string): Promise<SelectOption[]> => {
    const response = await invoicesApi.getSelectOptions({ q: search })
    return response.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search Input */}
      <Input
        placeholder="Search invoice number or client..."
        value={filters.search ?? ''}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      {/* Client Dropdown */}
      <AsyncSelect
        value={filters.client_id ?? null}
        onChange={handleClientChange}
        loadOptions={loadClients}
        placeholder="All Clients"
        className="w-[200px]"
      />

      {/* Status Dropdown */}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
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
