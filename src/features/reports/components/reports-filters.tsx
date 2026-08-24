/**
 * Reports Filters Component
 * Date range picker, client dropdown, and search controls
 */
import { useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useReportsStore } from '../store/reports-store'

export function ReportsFilters() {
  const {
    filters,
    clients,
    isLoadingClients,
    fetchClients,
    setFilters,
    fetchReports,
    resetFilters,
  } = useReportsStore()

  // Fetch clients on mount
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const newFilters: Record<string, string | undefined> = {}

    if (range?.from) {
      newFilters.date_from = format(range.from, 'yyyy-MM-dd')
    } else {
      newFilters.date_from = undefined
    }

    if (range?.to) {
      newFilters.date_to = format(range.to, 'yyyy-MM-dd')
    } else {
      newFilters.date_to = undefined
    }

    setFilters(newFilters)
  }

  const handleClientChange = (value: string | null) => {
    if (!value || value === 'all') {
      setFilters({ client_id: undefined })
    } else {
      setFilters({ client_id: Number.parseInt(value, 10) })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value
    setFilters({ search: search || undefined })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReports()
  }

  const handleReset = () => {
    resetFilters()
  }

  const hasActiveFilters =
    filters.date_from ||
    filters.date_to ||
    filters.client_id ||
    filters.search

  // Parse current date range from filters
  const currentDateRange: DateRange = {
    from: filters.date_from ? new Date(filters.date_from) : undefined,
    to: filters.date_to ? new Date(filters.date_to) : undefined,
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !currentDateRange.from && 'text-muted-foreground'
            )}
          >
            {currentDateRange.from ? (
              currentDateRange.to ? (
                <>
                  {format(currentDateRange.from, 'LLL dd, yyyy')} -{' '}
                  {format(currentDateRange.to, 'LLL dd, yyyy')}
                </>
              ) : (
                format(currentDateRange.from, 'LLL dd, yyyy')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={currentDateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            disabled={(date: Date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>

      {/* Client Dropdown */}
      <Select
        value={filters.client_id?.toString() ?? 'all'}
        onValueChange={handleClientChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {isLoadingClients ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-1">
        <Input
          placeholder="Search reports..."
          value={filters.search ?? ''}
          onChange={handleSearchChange}
          className="w-[200px]"
        />
        <Button type="submit" variant="default" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

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
