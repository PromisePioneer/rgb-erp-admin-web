/**
 * Clients Table Component
 * DataTable with shadcn Table, actions, and pagination
 */
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useClientsStore } from '../store/clients-store'
import { ClientsFilters } from './clients-filters'

export function ClientsTable() {
  const { items, isLoading, pagination, fetchClients, filters, remove, isSubmitting } =
    useClientsStore()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Fetch clients on mount and when filters change
  useEffect(() => {
    fetchClients(filters)
  }, [fetchClients, filters])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) return
    fetchClients({ ...filters, page: newPage })
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    try {
      await remove(deleteId)
      setDeleteId(null)
    } catch {
      // Error is handled in store
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value)
  }

  const totalPages = Math.ceil(pagination.total / pagination.per_page) || 1

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ClientsFilters />
        <Link to="/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Service Price</TableHead>
              <TableHead>Expired Date</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium mb-1">No clients found</p>
                    <p className="text-sm">
                      Try adjusting your filters or add a new client
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.client_type_name ?? '-'}</TableCell>
                  <TableCell>{client.phone ?? '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={client.address ?? ''}>
                    {client.address ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(client.service_price)}
                  </TableCell>
                  <TableCell>{formatDate(client.expired_date)}</TableCell>
                  <TableCell>
                    {client.status === 1 ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Link to="/clients/$id/edit" params={{ id: client.id.toString() }}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog
                      open={deleteId === client.id}
                      onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(client.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{client.name}</strong>? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isSubmitting && deleteId === client.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
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
            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {pagination.current_page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
