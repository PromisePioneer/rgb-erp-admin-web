/**
 * DataTable Component
 * Reusable data table with standardized structure, loading, pagination, and row selection
 */
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, type PaginationMetadata } from './data-table-pagination'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Column definition type
export interface DataTableColumn<T> {
  accessorKey?: keyof T
  id?: string
  header: string
  cell?: (row: T, meta?: { rowIndex: number }) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  pagination: PaginationMetadata
  isLoading?: boolean
  onPageChange: (page: number) => void
  emptyMessage?: string
  className?: string
  rowKey?: keyof T
  // Row click handler
  onRowClick?: (row: T) => void
  // Row selection props
  enableRowSelection?: boolean
  selectedIds?: Set<number | string>
  onSelectionChange?: (selectedIds: Set<number | string>) => void
  bulkActions?: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  pagination,
  isLoading = false,
  onPageChange,
  emptyMessage = 'No data found',
  className,
  rowKey = 'id' as keyof T,
  onRowClick,
  enableRowSelection = false,
  selectedIds = new Set(),
  onSelectionChange,
  bulkActions,
}: DataTableProps<T>) {
  // Render cell value based on column definition
  const renderCell = (row: T, column: DataTableColumn<T>) => {
    if (column.cell) {
      return column.cell(row)
    }
    if (column.accessorKey) {
      const value = row[column.accessorKey]
      return value !== null && value !== undefined ? String(value) : '-'
    }
    return '-'
  }

  // Handle individual row selection
  const handleRowSelect = (rowId: number | string, checked: boolean) => {
    if (!onSelectionChange) return
    const newSelection = new Set(selectedIds)
    if (checked) {
      newSelection.add(rowId)
    } else {
      newSelection.delete(rowId)
    }
    onSelectionChange(newSelection)
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      const allIds = new Set(data.map((row) => String(row[rowKey])))
      onSelectionChange(allIds)
    } else {
      onSelectionChange(new Set())
    }
  }

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && data.every((row) => selectedIds.has(String(row[rowKey])))

  // Calculate total columns including selection column
  const totalColumns = columns.length + (enableRowSelection ? 1 : 0)

  return (
    <div className={className}>
      {/* Bulk Actions Bar */}
      {enableRowSelection && selectedIds.size > 0 && bulkActions && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted/50 rounded-md border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          {bulkActions}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {enableRowSelection && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading state - skeleton rows */}
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  {enableRowSelection && (
                    <TableCell className="w-[40px]">
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              /* Empty state */
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium mb-1">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* Data rows */
              data.map((row) => {
                const rowId = String(row[rowKey])
                const isSelected = selectedIds.has(rowId)
                return (
                  <TableRow
                    key={rowId}
                    className={cn(isSelected && 'bg-muted/50', onRowClick && 'cursor-pointer')}
                    data-selected={isSelected}
                    onClick={() => onRowClick?.(row)}
                  >
                    {enableRowSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleRowSelect(rowId, e.target.checked)
                          }}
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {renderCell(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          className="mt-4"
        />
      )}
    </div>
  )
}
