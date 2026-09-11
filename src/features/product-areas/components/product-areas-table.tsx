/**
 * Product Areas Table Component
 * List view with filters, pagination, and actions
 */
import { useEffect, useState } from 'react'
import { Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProductAreasStore } from '../store/product-areas-store'

export function ProductAreasTable() {
  const {
    items,
    isLoading,
    error,
    filters,
    pagination,
    areaOptions,
    fetchItems,
    fetchAreaOptions,
    setFilters,
  } = useProductAreasStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all')

  // Initial fetch
  useEffect(() => {
    fetchAreaOptions()
    fetchItems()
  }, [fetchAreaOptions, fetchItems])

  // Handle search
  const handleSearch = () => {
    setFilters({ search: searchTerm || undefined })
    fetchItems({ ...filters, search: searchTerm || undefined, page: 1 })
  }

  // Handle area filter
  const handleAreaChange = (value: string | null) => {
    if (!value) return
    setSelectedAreaId(value)
    const areaId = value === 'all' ? undefined : parseInt(value)
    setFilters({ area_id: areaId })
    fetchItems({ ...filters, area_id: areaId, page: 1 })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchItems({ ...filters, page })
  }

  // Format number
  const formatNumber = (num: number | string) => {
    return new Intl.NumberFormat('id-ID').format(Number(num))
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Areas</h2>
          <p className="text-muted-foreground">
            Stok produk per Area/Client
          </p>
        </div>
        <Button onClick={() => window.location.href = '/product-areas/new'}>
          <Warehouse className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="w-[200px]">
          <Select value={selectedAreaId} onValueChange={handleAreaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Area</SelectItem>
              {areaOptions.map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Kondisi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Warehouse className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Tidak ada data product area</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.product_name || '-'}</TableCell>
                  <TableCell>{item.area_name || '-'}</TableCell>
                  <TableCell>{item.client_name || '-'}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.stock)}</TableCell>
                  <TableCell className="text-center">
                    {item.condition ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.condition_color}`}>
                        {item.condition_label}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 1 ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page === 1}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
