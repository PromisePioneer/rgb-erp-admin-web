/**
 * Master Data Hub Component
 * Centralized navigation hub for all master data CRUD modules
 */

import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MasterDataItem {
  id: string
  name: string
  nameId: string
  description: string
  descriptionId: string
  icon: React.ElementType
  path: string
  count: number
  isImplemented: boolean
}

// Master data configuration
const masterDataItems: MasterDataItem[] = [
  {
    id: 'provinces',
    name: 'Provinces',
    nameId: 'Provinsi',
    description: 'Data province',
    descriptionId: 'Data provinsi',
    icon: Globe,
    path: '/provinces',
    count: 38,
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
    count: 24,
    isImplemented: true,
  },
  {
    id: 'locations',
    name: 'Locations',
    nameId: 'Lokasi',
    description: 'Data location',
    descriptionId: 'Data lokasi',
    icon: MapPin,
    path: '/locations',
    count: 156,
    isImplemented: false,
  },
  {
    id: 'employee-types',
    name: 'Employee Types',
    nameId: 'Jenis Karyawan',
    description: 'Employee type data',
    descriptionId: 'Jenis karyawan',
    icon: Users,
    path: '/employee-types',
    count: 5,
    isImplemented: false,
  },
  {
    id: 'violation-types',
    name: 'Violation Types',
    nameId: 'Jenis Pelanggaran',
    description: 'Violation type data',
    descriptionId: 'Jenis pelanggaran',
    icon: AlertTriangle,
    path: '/violation-types',
    count: 32,
    isImplemented: false,
  },
  {
    id: 'categories',
    name: 'Categories',
    nameId: 'Kategori',
    description: 'Category data',
    descriptionId: 'Data kategori',
    icon: Tags,
    path: '/categories',
    count: 18,
    isImplemented: false,
  },
]

interface MasterDataCardProps {
  item: MasterDataItem
  onClick: () => void
}

function MasterDataCard({ item, onClick }: MasterDataCardProps) {
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
          {item.count} data
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

  return (
    <div className="space-y-6">
      {/* Search Field */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search master data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards Grid - 3 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <MasterDataCard
            key={item.id}
            item={item}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
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
