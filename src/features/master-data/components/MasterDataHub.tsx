/**
 * Master Data Hub Component
 * Centralized navigation hub for all master data CRUD modules
 */

import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Globe,
  Building2,
  MapPin,
  Users,
  AlertTriangle,
  Tags,
  ArrowRight,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { masterDataStatsApi, type MasterDataStats } from '../api/master-data-stats-api'

interface MasterDataItem {
  id: string
  name: string
  nameId: string
  description: string
  descriptionId: string
  icon: LucideIcon
  path: string
  countKey: keyof MasterDataStats
  isImplemented: boolean
}

// Master data configuration - maps to stats keys
const masterDataItems: MasterDataItem[] = [
  {
    id: 'provinces',
    name: 'Provinces',
    nameId: 'Provinsi',
    description: 'Data province',
    descriptionId: 'Data provinsi',
    icon: Globe,
    path: '/provinces',
    countKey: 'provinces',
    isImplemented: true,
  },
  {
    id: 'departments',
    name: 'Departments',
    nameId: 'Departemen',
    description: 'Data department',
    descriptionId: 'Data departemen',
    icon: Building2,
    path: '/departments',
    countKey: 'departments',
    isImplemented: true,
  },
  {
    id: 'clients',
    name: 'Clients',
    nameId: 'Klien',
    description: 'Data client',
    descriptionId: 'Data klien',
    icon: Building2,
    path: '/clients',
    countKey: 'clients',
    isImplemented: true,
  },
  {
    id: 'positions',
    name: 'Positions',
    nameId: 'Posisi',
    description: 'Data position',
    descriptionId: 'Data posisi',
    icon: Users,
    path: '/positions',
    countKey: 'positions',
    isImplemented: true,
  },
  {
    id: 'employees',
    name: 'Employees',
    nameId: 'Karyawan',
    description: 'Data employee',
    descriptionId: 'Data karyawan',
    icon: Users,
    path: '/employees',
    countKey: 'employees',
    isImplemented: true,
  },
  {
    id: 'areas',
    name: 'Areas',
    nameId: 'Area',
    description: 'Data area',
    descriptionId: 'Data area',
    icon: MapPin,
    path: '/areas',
    countKey: 'areas',
    isImplemented: true,
  },
  {
    id: 'poss',
    name: 'Poss',
    nameId: 'POS',
    description: 'Data pos',
    descriptionId: 'Data pos',
    icon: MapPin,
    path: '/poss',
    countKey: 'poss',
    isImplemented: true,
  },
  {
    id: 'roles',
    name: 'Roles',
    nameId: 'Peran',
    description: 'Data role',
    descriptionId: 'Data peran',
    icon: Users,
    path: '/roles',
    countKey: 'roles',
    isImplemented: true,
  },
  {
    id: 'client-types',
    name: 'Client Types',
    nameId: 'Tipe Klien',
    description: 'Data client type',
    descriptionId: 'Data tipe klien',
    icon: Tags,
    path: '/client-types',
    countKey: 'client_types',
    isImplemented: true,
  },
  {
    id: 'banks',
    name: 'Banks',
    nameId: 'Bank',
    description: 'Data bank',
    descriptionId: 'Data bank',
    icon: Building2,
    path: '/banks',
    countKey: 'banks',
    isImplemented: true,
  },
  {
    id: 'bank-accounts',
    name: 'Bank Accounts',
    nameId: 'Akun Bank',
    description: 'Data bank account',
    descriptionId: 'Data akun bank',
    icon: Building2,
    path: '/bank-accounts',
    countKey: 'bank_accounts',
    isImplemented: true,
  },
  {
    id: 'warehouses',
    name: 'Warehouses',
    nameId: 'Gudang',
    description: 'Data warehouse',
    descriptionId: 'Data gudang',
    icon: Building2,
    path: '/warehouses',
    countKey: 'warehouses',
    isImplemented: true,
  },
  {
    id: 'product-categories',
    name: 'Product Categories',
    nameId: 'Kategori Produk',
    description: 'Data product category',
    descriptionId: 'Data kategori produk',
    icon: Tags,
    path: '/product-categories',
    countKey: 'product_categories',
    isImplemented: true,
  },
  {
    id: 'products',
    name: 'Products',
    nameId: 'Produk',
    description: 'Data product',
    descriptionId: 'Data produk',
    icon: Tags,
    path: '/products',
    countKey: 'products',
    isImplemented: true,
  },
  {
    id: 'daily-task-items',
    name: 'Daily Task Items',
    nameId: 'Item Tugas Harian',
    description: 'Data daily task item',
    descriptionId: 'Data item tugas harian',
    icon: AlertTriangle,
    path: '/daily-task-items',
    countKey: 'daily_task_items',
    isImplemented: true,
  },
]

interface MasterDataCardProps {
  item: MasterDataItem
  count: number
  onClick: () => void
}

function MasterDataCard({ item, count, onClick }: MasterDataCardProps) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      disabled={!item.isImplemented}
      className={cn(
        'group relative flex flex-col rounded-lg border bg-white p-5 text-left transition-all duration-200',
        'hover:border-gray-300 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        item.isImplemented
          ? 'cursor-pointer'
          : 'cursor-not-allowed opacity-60'
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition-colors group-hover:bg-gray-100">
        <Icon className="h-5 w-5" />
      </div>

      {/* Title */}
      <h3 className="mb-1 font-semibold text-gray-900">{item.nameId}</h3>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-500">{item.descriptionId}</p>

      {/* Footer: Count and Arrow */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {count.toLocaleString('id-ID')} data
        </span>
        <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-600" />
      </div>

      {/* Not implemented indicator */}
      {!item.isImplemented && (
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
            Segera
          </span>
        </div>
      )}
    </button>
  )
}

export function MasterDataHub() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<MasterDataStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const response = await masterDataStatsApi.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch master data stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return masterDataItems

    const query = searchQuery.toLowerCase()
    return masterDataItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.nameId.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.descriptionId.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleCardClick = (item: MasterDataItem) => {
    if (item.isImplemented) {
      navigate({ to: item.path })
    }
  }

  const getCount = (item: MasterDataItem): number => {
    if (!stats) return 0
    return stats[item.countKey] || 0
  }

  return (
    <div className="space-y-6">
      {/* Search Field */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari master data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-white p-5"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200" />
              <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
              <div className="mb-4 h-3 w-32 rounded bg-gray-200" />
              <div className="mt-auto h-3 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {/* Cards Grid - 3 columns */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MasterDataCard
              key={item.id}
              item={item}
              count={getCount(item)}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Tidak ada data ditemukan
          </h3>
          <p className="text-sm text-gray-500">
            Coba ubah kata kunci pencarian Anda
          </p>
        </div>
      )}
    </div>
  )
}
