/**
 * Balance Sheet View Component
 * Displays balance sheet with assets, liabilities, and equity
 */
import { useEffect } from 'react'
import { Scale } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useBalanceSheetStore } from '../store/finance-store'

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
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function BalanceSheetView() {
  const {
    data,
    isLoading,
    error,
    filters,
    fetchBalanceSheet,
    setFilters,
    clearError,
  } = useBalanceSheetStore()

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchBalanceSheet()
  }, [filters.as_of, fetchBalanceSheet])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ as_of: e.target.value })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="as_of" className="text-sm text-muted-foreground">
            As of
          </label>
          <Input
            id="as_of"
            type="date"
            value={filters.as_of}
            onChange={handleDateChange}
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
        <div className="grid md:grid-cols-2 gap-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {/* Balance Sheet */}
      {!isLoading && data && (
        <>
          <p className="text-sm text-muted-foreground">
            As of {formatDate(data.as_of)}
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Assets Card */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Assets</h3>
              </div>
              <div className="p-4">
                {data.assets.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No assets in this period
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.assets.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-muted-foreground">
                            {item.name}
                          </td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border font-bold">
                        <td className="py-2">Total Assets</td>
                        <td className="py-2 text-right text-primary">
                          {formatCurrency(data.assets.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            {/* Liabilities & Equity Card */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Liabilities & Equity</h3>
              </div>
              <div className="p-4">
                {/* Liabilities Section */}
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Liabilities
                  </p>
                  {data.liabilities.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No liabilities in this period
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {data.liabilities.items.map((item) => (
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
                          <td className="py-1.5">Total Liabilities</td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(data.liabilities.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Equity Section */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Equity
                  </p>
                  {data.equity.items.length === 0 && data.equity.current_earnings === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No equity in this period
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {data.equity.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-1.5 text-muted-foreground">
                              {item.name}
                            </td>
                            <td className="py-1.5 text-right">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td className="py-1.5 text-muted-foreground">
                            Current Earnings
                          </td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(data.equity.current_earnings)}
                          </td>
                        </tr>
                        <tr className="border-t border-border/60 font-medium">
                          <td className="py-1.5">Total Equity</td>
                          <td className="py-1.5 text-right">
                            {formatCurrency(data.equity.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Total Liabilities & Equity */}
                <div className="border-t border-border mt-4 pt-4 font-bold">
                  <div className="flex justify-between">
                    <span>Total Liabilities & Equity</span>
                    <span className="text-primary">
                      {formatCurrency(data.totals.liabilities_equity)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Balance Status */}
          <div className="text-center mt-4">
            {data.is_balanced ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                Balanced
              </Badge>
            ) : (
              <Badge variant="destructive">
                Out of balance by {formatCurrency(Math.abs(data.totals.difference))}
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !data && (
        <Card className="p-8 text-center">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No balance sheet data available
          </p>
        </Card>
      )}
    </div>
  )
}
