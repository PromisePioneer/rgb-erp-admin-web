/**
 * Command Palette Component
 * Quick search and navigation (Cmd+K / Ctrl+K)
 */
import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Search,
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Briefcase,
  FileText,
  Settings,
  Database,
  Book,
  Scale,
  Building,
  Layers,
  Calendar,
  TrendingUp,
  LayoutDashboard as Layout,
  Wallet,
  BarChart3,
  Warehouse,
  Package,
  Scan,
  ClipboardList,
  ShoppingCart,
  Inbox,
  Boxes,
  FolderKanban,
  ScanFace,
  Camera,
  AlertTriangle,
  Megaphone,
  MapPin,
  Clock,
  Coins,
  Receipt,
  ChevronRight,
  Command,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  category: string
  keywords?: string[]
}

const menuItems: CommandItem[] = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Overview' },

  // Master Data
  { id: 'master-data', label: 'Master Data', path: '/master-data', icon: Database, category: 'Master Data' },

  // Accounting
  { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/chart-of-accounts', icon: Book, category: 'Accounting' },
  { id: 'journal-entries', label: 'Journal Entries', path: '/journal-entries', icon: FileText, category: 'Accounting' },
  { id: 'opening-balance', label: 'Opening Balance', path: '/opening-balance', icon: Scale, category: 'Accounting' },
  { id: 'fixed-assets', label: 'Fixed Assets', path: '/fixed-assets', icon: Building, category: 'Accounting' },
  { id: 'asset-classes', label: 'Tangible Asset Classes', path: '/tangible-asset-classes', icon: Layers, category: 'Accounting' },
  { id: 'accounting-periods', label: 'Accounting Periods', path: '/accounting-periods', icon: Calendar, category: 'Accounting' },

  // Financial Reports
  { id: 'trial-balance', label: 'Trial Balance', path: '/reports/trial-balance', icon: Scale, category: 'Reports' },
  { id: 'income-statement', label: 'Income Statement', path: '/reports/income-statement', icon: TrendingUp, category: 'Reports' },
  { id: 'balance-sheet', label: 'Balance Sheet', path: '/reports/balance-sheet', icon: Layout, category: 'Reports' },
  { id: 'cash-flow', label: 'Cash Flow', path: '/reports/cash-flow', icon: Wallet, category: 'Reports' },
  { id: 'equity-statement', label: 'Equity Statement', path: '/reports/equity-statement', icon: BarChart3, category: 'Reports' },

  // Human Resources
  { id: 'employees', label: 'Employees', path: '/employees', icon: Users, category: 'HR' },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock, category: 'HR' },
  { id: 'schedules', label: 'Work Schedules', path: '/schedules', icon: Calendar, category: 'HR' },
  { id: 'shifts', label: 'Shifts', path: '/shifts', icon: Clock, category: 'HR' },

  // Finance
  { id: 'bank-accounts', label: 'Bank Accounts', path: '/bank-accounts', icon: Wallet, category: 'Finance' },
  { id: 'salary-components', label: 'Salary Components', path: '/salary-components', icon: Coins, category: 'Finance' },
  { id: 'petty-cash', label: 'Petty Cash', path: '/petty-cash', icon: Wallet, category: 'Finance' },
  { id: 'invoices', label: 'Invoices', path: '/invoices', icon: Receipt, category: 'Finance' },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: Wallet, category: 'Finance' },

  // Inventory
  { id: 'warehouses', label: 'Warehouses', path: '/warehouses', icon: Warehouse, category: 'Inventory' },
  { id: 'product-categories', label: 'Product Categories', path: '/product-categories', icon: Layers, category: 'Inventory' },
  { id: 'products', label: 'Products', path: '/products', icon: Package, category: 'Inventory' },
  { id: 'inventory-tracking', label: 'Inventory Tracking', path: '/inventory-tracking', icon: Scan, category: 'Inventory' },
  { id: 'purchase-requests', label: 'Purchase Requests', path: '/purchase-requests', icon: ClipboardList, category: 'Inventory' },
  { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, category: 'Inventory' },
  { id: 'fund-requests', label: 'Fund Requests', path: '/fund-requests', icon: Wallet, category: 'Inventory' },
  { id: 'receptions', label: 'Receptions', path: '/receptions', icon: Inbox, category: 'Inventory' },
  { id: 'stock-opnames', label: 'Stock Opname', path: '/stock-opnames', icon: Boxes, category: 'Inventory' },
  { id: 'stock-card', label: 'Stock Card', path: '/stock-card', icon: Layers, category: 'Inventory' },

  // Projects
  { id: 'projects', label: 'Projects', path: '/projects', icon: FolderKanban, category: 'Projects' },

  // Security & Ops
  { id: 'face-enrollments', label: 'Face Enrollments', path: '/face-enrollments', icon: ScanFace, category: 'Security' },
  { id: 'field-reports', label: 'Field Reports', path: '/reports', icon: Camera, category: 'Security' },
  { id: 'panic-alerts', label: 'Panic Alerts', path: '/panic-alerts', icon: AlertTriangle, category: 'Security' },
  { id: 'news', label: 'News', path: '/news', icon: Megaphone, category: 'Security' },
  { id: 'approvals', label: 'Approvals', path: '/approvals', icon: Inbox, category: 'Security' },
  { id: 'patrol-report', label: 'Patrol Reports', path: '/patrol-report', icon: MapPin, category: 'Security' },
  { id: 'checkpoints', label: 'Checkpoints', path: '/checkpoints', icon: MapPin, category: 'Security' },
  { id: 'daily-task-reports', label: 'Daily Task Reports', path: '/daily-task-reports', icon: ClipboardList, category: 'Security' },
  { id: 'daily-task-items', label: 'Daily Task Items', path: '/daily-task-items', icon: ClipboardList, category: 'Security' },

  // Administration
  { id: 'users', label: 'Users', path: '/users', icon: UserCog, category: 'Admin' },
  { id: 'clients', label: 'Clients', path: '/clients', icon: Building2, category: 'Admin' },
  { id: 'departments', label: 'Departments', path: '/departments', icon: Briefcase, category: 'Admin' },
  { id: 'roles', label: 'Roles', path: '/roles', icon: UserCog, category: 'Admin' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, category: 'Admin' },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredItems = React.useMemo(() => {
    if (!query) return menuItems

    const lowerQuery = query.toLowerCase()
    return menuItems.filter(item =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    )
  }, [query])

  // Group by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  const flatItems = filteredItems

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (flatItems[selectedIndex]) {
          navigate({ to: flatItems[selectedIndex].path })
          onOpenChange(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        onOpenChange(false)
        break
    }
  }, [flatItems, selectedIndex, navigate, onOpenChange])

  const handleSelect = (item: CommandItem) => {
    navigate({ to: item.path })
    onOpenChange(false)
  }

  let currentIndex = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-border/50">
        <div className="flex flex-col max-h-[400px]">
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, menus, features..."
              className="flex-1 h-14 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[340px]">
            {flatItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="py-1">
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  {items.map((item) => {
                    currentIndex++
                    const isSelected = currentIndex === selectedIndex
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isSelected && (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                ↑↓
              </kbd>
              <span>to navigate</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                ↵
              </kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>K to open</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
