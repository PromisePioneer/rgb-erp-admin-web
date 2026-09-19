/**
 * Panic Alerts Table Component
 * READ-ONLY - no create/edit/delete actions
 */
import {useEffect, useCallback, useState} from 'react'
import {Phone} from 'lucide-react'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {usePanicAlertsStore} from '@/features/panic-alerts'
import {PanicAlertsFilters} from './panic-alerts-filters'
import type {PanicAlert} from '@/features/panic-alerts'

export function PanicAlertsTable() {
    const {
        items,
        isLoading,
        pagination,
        fetchAlerts,
        filters,
    } = usePanicAlertsStore()

    // Selection state (for future bulk actions if needed)
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())

    // Single source of truth for fetch - debounced, primitive dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAlerts({search: filters.search, page: 1, per_page: 100})
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search])

    const handleSelectionChange = (newSelectedIds: Set<number | string>) => {
        setSelectedIds(newSelectedIds)
    }

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return
        fetchAlerts({...filters, page: newPage})
    }, [fetchAlerts, filters, pagination.last_page])

    // Format date/time
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString)
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Handle edit action
    const handleEdit = useCallback((alert: PanicAlert) => {
        console.log('Edit alert:', alert.id)
        // Navigate to edit page or open modal
    }, [])

    // Define columns
    const columns: DataTableColumn<PanicAlert>[] = [
        {
            accessorKey: 'created_at',
            header: 'Waktu',
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
          {formatDateTime(row.created_at)}
        </span>
            ),
        },
        {
            accessorKey: 'employee_name',
            header: 'Karyawan',
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.employee_name}</span>
                    {row.employee_phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3"/>
                            {row.employee_phone}
            </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'client_name',
            header: 'Client',
            cell: (row) => (
                <span className={row.client_name ? '' : 'text-muted-foreground'}>
          {row.client_name ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'area_name',
            header: 'Area',
            cell: (row) => (
                <span className={row.area_name ? '' : 'text-muted-foreground'}>
          {row.area_name ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'pos_name',
            header: 'Pos',
            cell: (row) => (
                <span className={row.pos_name ? '' : 'text-muted-foreground'}>
          {row.pos_name ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'latitude',
            header: 'Lat',
            cell: (row) => (
                <span className="font-mono text-xs text-muted-foreground">
          {row.latitude ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'longitude',
            header: 'Lng',
            cell: (row) => (
                <span className="font-mono text-xs text-muted-foreground">
          {row.longitude ?? '-'}
        </span>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <PanicAlertsFilters/>

            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="No panic alerts found"
                onRowClick={handleEdit}
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
            />
        </div>
    )
}
