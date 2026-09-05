/**
 * Action Column Helper for DataTable
 * Provides standardized "Click to edit (ROW)" functionality
 */
import { Pencil } from 'lucide-react'
import type { DataTableColumn } from '@/components/ui/data-table'

interface ActionColumnOptions<T> {
  /** Callback when row is clicked for edit */
  onEdit: (row: T) => void
  /** Display name for hint text */
  itemName?: string
  /** Whether to show pencil icon */
  showIcon?: boolean
}

/**
 * Creates a clickable name column for editing
 * Use this instead of making the name column clickable
 */
export function createActionColumn<T extends { id: number | string; name?: string }>({
  onEdit,
  itemName = 'data',
  showIcon = true,
}: ActionColumnOptions<T>): DataTableColumn<T> {
  return {
    accessorKey: 'action',
    header: '',
    className: 'w-[50px]',
    cell: (row: T) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(row)
        }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors cursor-pointer"
        title={`Edit ${row.name ?? itemName}`}
      >
        {showIcon && <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
        {!showIcon && <span className="text-xs text-muted-foreground">Edit</span>}
      </button>
    ),
  }
}

/**
 * Creates the hint text for click-to-edit
 */
export function getActionHint(itemName: string = 'data'): string {
  return `Klik ikon edit pada baris untuk mengubah ${itemName}`
}

/**
 * Combines action column with existing columns
 * Appends the action column at the end
 */
export function withActionColumn<T>(
  columns: DataTableColumn<T>[],
  actionColumn: DataTableColumn<T>
): DataTableColumn<T>[] {
  return [...columns, actionColumn]
}
