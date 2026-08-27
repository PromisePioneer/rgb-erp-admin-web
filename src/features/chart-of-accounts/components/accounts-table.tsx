"use client"
import { useEffect, useState } from 'react'
import { ChevronRight, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAccountsStore, type Account } from '../store/accounts-store'

const TYPE_COLORS: Record<string, string> = {
  asset: 'text-blue-600',
  liability: 'text-red-600',
  equity: 'text-purple-600',
  revenue: 'text-green-600',
  expense: 'text-orange-600',
}

const TYPE_LABELS: Record<string, string> = {
  asset: 'Aset',
  liability: 'Kewajiban',
  equity: 'Modal',
  revenue: 'Pendapatan',
  expense: 'Beban',
}

interface AccountRowProps {
  account: Account
  level: number
  expanded: boolean
  onToggle: (id: number) => void
  hasChildren: boolean
}

function AccountRow({ account, level, expanded, onToggle, hasChildren }: AccountRowProps) {
  const normalBalance = account.normal_balance || 'debit'

  return (
    <>
      <tr className="border-b hover:bg-muted/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center" style={{ paddingLeft: level * 24 }}>
            <button
              onClick={() => hasChildren && onToggle(account.id)}
              className="p-1 hover:bg-muted rounded mr-2"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <span className="w-4" />
              )}
            </button>
            <span className="font-mono text-sm">{account.code}</span>
          </div>
        </td>
        <td className={`px-4 py-3 ${account.is_header ? 'font-medium' : ''}`}>
          {account.name}
        </td>
        <td className={`px-4 py-3 capitalize ${TYPE_COLORS[account.type] || ''}`}>
          {TYPE_LABELS[account.type] || account.type}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs px-2 py-1 rounded ${
            account.is_header ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
          }`}>
            {account.is_header ? 'Header' : 'Detail'}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs px-2 py-1 rounded ${
            normalBalance === 'debit' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
          }`}>
            {normalBalance.toUpperCase()}
          </span>
        </td>
      </tr>
      {expanded && account.children?.map(child => (
        <AccountRow
          key={child.id}
          account={child}
          level={level + 1}
          expanded={false}
          onToggle={onToggle}
          hasChildren={(child.children?.length ?? 0) > 0}
        />
      ))}
    </>
  )
}

export function AccountsTable() {
  const { items, isLoading, fetchAccounts, setFilters, filters } = useAccountsStore()
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 2, 3, 4, 5])) // Default expanded

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleTypeChange = (value: string) => {
    setFilters({ ...filters, type: value })
  }

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value })
  }

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Cari akun..."
          defaultValue={filters.search}
          onChange={e => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filters.type || 'all'} onValueChange={v => v && handleTypeChange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="asset">Aset</SelectItem>
            <SelectItem value="liability">Kewajiban</SelectItem>
            <SelectItem value="equity">Modal</SelectItem>
            <SelectItem value="revenue">Pendapatan</SelectItem>
            <SelectItem value="expense">Beban</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => fetchAccounts()}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Kode</th>
              <th className="px-4 py-3 text-left font-medium">Nama Akun</th>
              <th className="px-4 py-3 text-left font-medium">Tipe</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Normal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data akun
                </td>
              </tr>
            ) : (
              items.map(acc => (
                <AccountRow
                  key={acc.id}
                  account={acc}
                  level={0}
                  expanded={expanded.has(acc.id)}
                  onToggle={toggle}
                  hasChildren={(acc.children?.length ?? 0) > 0}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
