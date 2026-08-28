/**
 * Ledger View Component
 * Displays ledger for a specific account with transactions
 */
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Book } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLedgerStore } from '../store/finance-store'

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

export function LedgerView() {
  const {
    accounts,
    selectedAccount,
    transactions,
    isLoading,
    error,
    filters,
    openingBalance,
    closingBalance,
    fetchAccounts,
    fetchLedger,
    setFilters,
    clearError,
  } = useLedgerStore()

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Fetch ledger when account or date range changes
  useEffect(() => {
    fetchLedger()
  }, [filters.account_id, filters.from, filters.to, fetchLedger])

  const handleAccountChange = (value: string | null) => {
    if (!value) return
    const accountId = value === 'all' ? undefined : Number.parseInt(value, 10)
    setFilters({ account_id: accountId })
  }

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
          <label className="text-sm text-muted-foreground">Account</label>
          <Select
            value={filters.account_id?.toString() ?? 'all'}
            onValueChange={handleAccountChange}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {/* No account selected */}
      {!filters.account_id && !isLoading && (
        <Card className="p-8 text-center">
          <Book className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Select an account to view its ledger
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && filters.account_id && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {/* Ledger Table */}
      {!isLoading && filters.account_id && (
        <>
          {/* Account Summary */}
          {selectedAccount && (
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {selectedAccount.code} - {selectedAccount.name}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedAccount.type} Account
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Opening Balance
                  </div>
                  <div className="font-medium">{formatCurrency(openingBalance)}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Transactions Table */}
          {transactions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No transactions found for this account in the selected period.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Reference</TableHead>
                    <TableHead className="text-right w-[150px]">Debit</TableHead>
                    <TableHead className="text-right w-[150px]">Credit</TableHead>
                    <TableHead className="text-right w-[150px]">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={5} className="font-medium">
                      Opening Balance
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(openingBalance)}
                    </TableCell>
                  </TableRow>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.reference ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : ''}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : ''}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tx.running_balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Closing Balance Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={5}>Closing Balance</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(closingBalance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
