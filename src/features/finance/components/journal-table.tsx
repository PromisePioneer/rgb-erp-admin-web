/**
 * Journal Table Component
 * Displays journal entries with date range filter
 */
import { useEffect } from 'react'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useJournalStore } from '../store/finance-store'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'dd MMM yyyy')
  } catch {
    return dateString
  }
}

export function JournalTable() {
  const {
    entries,
    isLoading,
    error,
    filters,
    fetchJournal,
    setFilters,
    clearError,
  } = useJournalStore()

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchJournal()
  }, [filters.from, filters.to, fetchJournal])

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ from: e.target.value })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ to: e.target.value })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="from" className="text-sm text-muted-foreground">
            From
          </label>
          <Input
            id="from"
            type="date"
            value={filters.from}
            onChange={handleFromChange}
            className="w-auto"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-sm text-muted-foreground">
            To
          </label>
          <Input
            id="to"
            type="date"
            value={filters.to}
            onChange={handleToChange}
            className="w-auto"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
          <Button variant="link" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Entries */}
      {!isLoading && entries.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No journal entries found in this period.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Generate invoices, payroll, or receptions to post entries.
          </p>
        </Card>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              {/* Header */}
              <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.description}</span>
                  {entry.reference && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {entry.reference}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(entry.date)}
                </span>
              </div>

              {/* Lines */}
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-full" />
                  <col className="w-40" />
                  <col className="w-40" />
                </colgroup>
                <tbody>
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="border-b border-border last:border-0">
                      <td
                        className={`px-6 py-2 truncate ${
                          line.credit > 0 ? 'pl-12 text-muted-foreground' : ''
                        }`}
                      >
                        <span className="font-mono text-xs mr-2">
                          {line.account_code}
                        </span>
                        <span className="truncate">{line.account_name}</span>
                      </td>
                      <td className="px-6 py-2 text-right text-muted-foreground whitespace-nowrap">
                        {line.debit > 0 ? formatCurrency(line.debit) : ''}
                      </td>
                      <td className="px-6 py-2 text-right text-muted-foreground whitespace-nowrap">
                        {line.credit > 0 ? formatCurrency(line.credit) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
