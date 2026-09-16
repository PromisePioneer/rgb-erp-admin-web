/**
 * Command Palette Component
 * Dropdown search menu for sidebar navigation (cmdk)
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
  Boxes,
  ScanFace,
  AlertTriangle,
  Clock,
  Coins,
  Receipt,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  category: string
}

const menuItems: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Overview' },
  { id: 'master-data', label: 'Master Data', path: '/master-data', icon: Database, category: 'Umum' },
  { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/chart-of-accounts', icon: Book, category: 'Akuntansi' },
  { id: 'journal-entries', label: 'Jurnal Umum', path: '/journal-entries', icon: FileText, category: 'Akuntansi' },
  { id: 'opening-balance', label: 'Saldo Awal', path: '/opening-balance', icon: Scale, category: 'Akuntansi' },
  { id: 'fixed-assets', label: 'Aset Tetap', path: '/fixed-assets', icon: Building, category: 'Akuntansi' },
  { id: 'accounting-periods', label: 'Periode Akuntansi', path: '/accounting-periods', icon: Calendar, category: 'Akuntansi' },
  { id: 'employees', label: 'Karyawan', path: '/employees', icon: Users, category: 'HR' },
  { id: 'attendance', label: 'Kehadiran', path: '/attendance', icon: Clock, category: 'HR' },
  { id: 'schedules', label: 'Jadwal Kerja', path: '/schedules', icon: Calendar, category: 'HR' },
  { id: 'shifts', label: 'Shift', path: '/shifts', icon: Clock, category: 'HR' },
  { id: 'bank-accounts', label: 'Rekening Bank', path: '/bank-accounts', icon: ClipboardList, category: 'Keuangan' },
  { id: 'salary-components', label: 'Komponen Gaji', path: '/salary-components', icon: Coins, category: 'Keuangan' },
  { id: 'invoices', label: 'Invoice', path: '/invoices', icon: Receipt, category: 'Keuangan' },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: Coins, category: 'Keuangan' },
  { id: 'warehouses', label: 'Gudang', path: '/warehouses', icon: Warehouse, category: 'Inventori' },
  { id: 'product-categories', label: 'Kategori Produk', path: '/product-categories', icon: Layers, category: 'Inventori' },
  { id: 'products', label: 'Produk', path: '/products', icon: Package, category: 'Inventori' },
  { id: 'inventory-tracking', label: 'Tracking Inventori', path: '/inventory', icon: Scan, category: 'Inventori' },
  { id: 'purchase-requests', label: 'Pengajuan Pembelian', path: '/purchase-requests', icon: ClipboardList, category: 'Inventori' },
  { id: 'purchase-orders', label: 'Purchase Order', path: '/purchase-orders', icon: ShoppingCart, category: 'Inventori' },
  { id: 'stock-opnames', label: 'Stock Opname', path: '/stock-opnames', icon: Boxes, category: 'Inventori' },
  { id: 'stock-card', label: 'Kartu Stok', path: '/stock-card', icon: Layers, category: 'Inventori' },
  { id: 'projects', label: 'Proyek', path: '/projects', icon: Building, category: 'Proyek' },
  { id: 'face-enrollments', label: 'Face Enrollment', path: '/face-enrollments', icon: ScanFace, category: 'Keamanan' },
  { id: 'panic-alerts', label: 'Panic Alert', path: '/panic-alerts', icon: AlertTriangle, category: 'Keamanan' },
  { id: 'approvals', label: 'Persetujuan', path: '/approvals', icon: ClipboardList, category: 'Keamanan' },
  { id: 'daily-task-items', label: 'Item Tugas Harian', path: '/daily-task-items', icon: ClipboardList, category: 'Keamanan' },
  { id: 'users', label: 'Users', path: '/users', icon: UserCog, category: 'Admin' },
  { id: 'clients', label: 'Clients', path: '/clients', icon: Building2, category: 'Admin' },
  { id: 'departments', label: 'Departemen', path: '/departments', icon: Briefcase, category: 'Admin' },
  { id: 'roles', label: 'Roles', path: '/roles', icon: UserCog, category: 'Admin' },
  { id: 'settings', label: 'Pengaturan', path: '/settings', icon: Settings, category: 'Admin' },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = (path: string) => {
    navigate({ to: path })
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Search Panel */}
      <div
        className="relative mx-auto mt-[15vh] w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={true}>
          {/* Search Input */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Command.Input
              ref={inputRef}
              placeholder="Ketik untuk mencari menu..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="overflow-y-auto max-h-[300px] p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada hasil.
            </Command.Empty>

            <Command.Group heading="Menu" className="px-2 py-1 text-xs text-muted-foreground">
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
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] sm:flex">
              ↑↓
            </kbd>
            <span>Navigasi</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
              ↵
            </kbd>
            <span>Pilih</span>
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
