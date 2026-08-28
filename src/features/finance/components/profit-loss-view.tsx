/**
 * Profit & Loss View Component
 * Displays income statement with revenue, expenses, and net profit/loss
 */
import { useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useProfitLossStore } from '../store/finance-store'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateRange(from: string, to: string): string {
  try {
    const fromDate = new Date(from).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const toDate = new Date(to).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return `${fromDate} - ${toDate}`
  } catch {
    return `${from} - ${to}`
  }
}

export function ProfitLossView() {
  const {
    data,
    isLoading,
    error,
    filters,
    fetchProfitLoss,
    setFilters,
    clearError,
  } = useProfitLossStore()

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProfitLoss()
  }, [filters.from, filters.to, fetchProfitLoss])

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
        <Card className="max-w-2xl">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      )}

      {/* Profit & Loss Statement */}
      {!isLoading && data && (
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-4">
            {formatDateRange(data.from, data.to)}
          </p>

          <Card>
            <div className="p-6">
              {/* Revenue Section */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Revenue
                </p>
                {data.revenue.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No revenue in this period.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.revenue.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-muted-foreground">
                            {item.name}
                          </td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border/60 font-medium">
                        <td className="py-2">Total Revenue</td>
                        <td className="py-2 text-right">
                          {formatCurrency(data.revenue.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Expenses Section */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Expenses
                </p>
                {data.expense.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No expenses in this period.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.expense.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-muted-foreground">
                            {item.name}
                          </td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border/60 font-medium">
                        <td className="py-2">Total Expenses</td>
                        <td className="py-2 text-right">
                          {formatCurrency(data.expense.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Net Profit/Loss */}
              <div className="border-t-2 border-border pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">
                    Net {data.net >= 0 ? 'Profit' : 'Loss'}
                  </span>
                  <span
                    className={`font-bold flex items-center gap-2 ${
                      data.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {data.net >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {formatCurrency(Math.abs(data.net))}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Badge */}
          <div className="mt-4 text-center">
            {data.net >= 0 ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                This period shows a profit
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                This period shows a loss
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !data && (
        <Card className="max-w-2xl p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No profit & loss data available
          </p>
        </Card>
      )}
    </div>
  )
}
