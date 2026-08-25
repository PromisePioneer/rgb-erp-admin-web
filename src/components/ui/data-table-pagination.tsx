/**
 * DataTable Pagination Component
 * Reusable pagination controls with first/prev/next/last buttons
 */
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PaginationMetadata {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface DataTablePaginationProps {
  pagination: PaginationMetadata
  onPageChange: (page: number) => void
  className?: string
}

export function DataTablePagination({
  pagination,
  onPageChange,
  className,
}: DataTablePaginationProps) {
  const { current_page, last_page, per_page, total } = pagination

  // Calculate showing range
  const from = (current_page - 1) * per_page + 1
  const to = Math.min(current_page * per_page, total)

  // Disable states
  const isFirstPage = current_page <= 1
  const isLastPage = current_page >= last_page

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      {/* Results info */}
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total} results
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(current_page - 1)}
          disabled={isFirstPage}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page indicator */}
        <span className="px-3 text-sm font-medium">
          Page {current_page} of {last_page}
        </span>

        {/* Next page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(current_page + 1)}
          disabled={isLastPage}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(last_page)}
          disabled={isLastPage}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
