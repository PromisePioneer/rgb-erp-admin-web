/**
 * Command Palette Component
 * Dropdown search menu for sidebar navigation
 */
import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Command } from 'cmdk'
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
  Warehouse,
  Package,
  Scan,
  ClipboardList,
  ShoppingCart,
  Inbox,
  Boxes,
  FolderKanban,
  ScanFace,
  AlertTriangle,
  Clock,
  Coins,
  Receipt,
  X,
} from 'lucide-react'

interface CommandPaletteItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  category: string
}

const menuItems: CommandPaletteItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Overview' },
  { id: 'master-data', label: 'Master Data', path: '/master-data', icon: Database, category: 'Master Data' },
  { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/chart-of-accounts', icon: Book, category: 'Accounting' },
  { id: 'journal-entries', label: 'Journal Entries', path: '/journal-entries', icon: FileText, category: 'Accounting' },
  { id: 'opening-balance', label: 'Opening Balance', path: '/opening-balance', icon: Scale, category: 'Accounting' },
  { id: 'fixed-assets', label: 'Fixed Assets', path: '/fixed-assets', icon: Building, category: 'Accounting' },
  { id: 'accounting-periods', label: 'Accounting Periods', path: '/accounting-periods', icon: Calendar, category: 'Accounting' },
  { id: 'employees', label: 'Employees', path: '/employees', icon: Users, category: 'HR' },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock, category: 'HR' },
  { id: 'schedules', label: 'Work Schedules', path: '/schedules', icon: Calendar, category: 'HR' },
  { id: 'shifts', label: 'Shifts', path: '/shifts', icon: Clock, category: 'HR' },
  { id: 'bank-accounts', label: 'Bank Accounts', path: '/bank-accounts', icon: FolderKanban, category: 'Finance' },
  { id: 'salary-components', label: 'Salary Components', path: '/salary-components', icon: Coins, category: 'Finance' },
  { id: 'invoices', label: 'Invoices', path: '/invoices', icon: Receipt, category: 'Finance' },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: FolderKanban, category: 'Finance' },
  { id: 'warehouses', label: 'Warehouses', path: '/warehouses', icon: Warehouse, category: 'Inventory' },
  { id: 'product-categories', label: 'Product Categories', path: '/product-categories', icon: Layers, category: 'Inventory' },
  { id: 'products', label: 'Products', path: '/products', icon: Package, category: 'Inventory' },
  { id: 'inventory-tracking', label: 'Inventory Tracking', path: '/inventory-tracking', icon: Scan, category: 'Inventory' },
  { id: 'purchase-requests', label: 'Purchase Requests', path: '/purchase-requests', icon: ClipboardList, category: 'Inventory' },
  { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, category: 'Inventory' },
  { id: 'stock-opnames', label: 'Stock Opname', path: '/stock-opnames', icon: Boxes, category: 'Inventory' },
  { id: 'stock-card', label: 'Stock Card', path: '/stock-card', icon: Layers, category: 'Inventory' },
  { id: 'projects', label: 'Projects', path: '/projects', icon: FolderKanban, category: 'Projects' },
  { id: 'face-enrollments', label: 'Face Enrollments', path: '/face-enrollments', icon: ScanFace, category: 'Security' },
  { id: 'panic-alerts', label: 'Panic Alerts', path: '/panic-alerts', icon: AlertTriangle, category: 'Security' },
  { id: 'approvals', label: 'Approvals', path: '/approvals', icon: Inbox, category: 'Security' },
  { id: 'daily-task-items', label: 'Daily Task Items', path: '/daily-task-items', icon: ClipboardList, category: 'Security' },
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
  const [search, setSearch] = React.useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSearch('')
    }
  }, [open])

  const handleSelect = (path: string) => {
    navigate({ to: path })
    onOpenChange(false)
    setSearch('')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Search Panel */}
      <div
        className="relative mx-auto mt-[15vh] w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menus..."
            className="flex-1 h-12 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ESC
          </kbd>
        </div>

        {/* Results - using cmdk Command */}
        <Command className="overflow-y-auto max-h-[300px]" shouldFilter={true}>
          <Command.List className="overflow-y-auto max-h-[300px] py-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Menus" className="px-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.path)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent data-[selected=true]:bg-accent"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>
        </Command>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              ↑
            </kbd>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              ↓
            </kbd>
            <span className="ml-1">navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              ↵
            </kbd>
            <span className="ml-1">select</span>
          </div>
        </div>
      </div>
    </div>
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
