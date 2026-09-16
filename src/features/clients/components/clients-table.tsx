/**
 * Clients Table Component
 * Navigate to form page for create/edit
 */
import {useEffect, useState, useCallback} from 'react'
import {Plus, Trash2, MapPin, MoreHorizontal, FileText, Eye} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {useNavigate} from '@tanstack/react-router'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {DataTable, type DataTableColumn} from '@/components/ui/data-table'
import {useClientsStore} from '../store/clients-store'
import {ClientsFilters} from './clients-filters'
import type {Client} from '../types/clients.types'
import {mouApi} from '@/features/mou/api/mou-api'
import type {MouDetail} from '@/features/mou/types/mou.types'
import {MouWizardModal} from '@/features/mou'

// Helper: Format date to D/M/YYYY
function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-'
    try {
        const d = new Date(dateStr)
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    } catch {
        return dateStr
    }
}

export function ClientsTable() {
    const navigate = useNavigate()
    const {
        items,
        isLoading,
        pagination,
        fetchClients,
        filters,
        bulkDelete,
        isSubmitting,
    } = useClientsStore()

    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // MOU modal state - View only
    const [showMouModal, setShowMouModal] = useState(false)
    const [mouData, setMouData] = useState<MouDetail | null>(null)
    const [mouLoading, setMouLoading] = useState(false)
    const [mouViewClient, setMouViewClient] = useState<{ id: number; name: string } | null>(null)

    // MOU Create modal state
    const [showMouCreate, setShowMouCreate] = useState(false)
    const [mouCreateClient, setMouCreateClient] = useState<{ id: number; name: string } | null>(null)

    // Single source of truth for fetch - debounced, primitive dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients({search: filters.search, client_type_id: filters.client_type_id, page: 1, per_page: 15})
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search, filters.client_type_id])

    // Reset selection when data changes
    useEffect(() => {
        setSelectedIds((prev) => {
            const newSelection = new Set<number | string>()
            prev.forEach((id) => {
                if (items.some((item) => item.id === id)) {
                    newSelection.add(id)
                }
            })
            return newSelection
        })
    }, [items])

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > pagination.last_page) return
        fetchClients({search: filters.search, client_type_id: filters.client_type_id, page: newPage, per_page: 15})
    }, [fetchClients, filters.search, filters.client_type_id, pagination.last_page])

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        setIsDeleting(true)
        try {
            await bulkDelete(Array.from(selectedIds).map(Number))
            setSelectedIds(new Set())
            setShowDeleteConfirm(false)
        } catch {
            // Error handled in store
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAddNew = () => {
        navigate({to: '/clients/new'})
    }

    const handleEdit = (client: Client) => {
        navigate({to: '/clients/$id', params: {id: client.id.toString()}})
    }

    const handleViewAreas = (client: Client) => {
        navigate({to: '/areas', search: {client_id: client.id, client_name: client.name}})
    }

    const handleViewMou = async (client: Client) => {
        setMouViewClient({id: client.id, name: client.name})
        setMouLoading(true)
        try {
            const response = await mouApi.getByClientId(client.id)
            if (response.success) {
                setMouData(response.data)
            } else {
                setMouData(null)
            }
            setShowMouModal(true)
        } catch {
            // MOU not found
            setMouData(null)
            setShowMouModal(true)
        } finally {
            setMouLoading(false)
        }
    }

    const handleMouCreateSuccess = () => {
        setShowMouCreate(false)
        setMouCreateClient(null)
        fetchClients()
    }

    // Create action column
    const columns: DataTableColumn<Client>[] = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: (row) => (
                <span className="font-mono text-sm text-muted-foreground">
          {row.code ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (row) => (
                <span className="font-medium">
          {row.name}
        </span>
            ),
        },
        {
            accessorKey: 'client_type_name',
            header: 'Type',
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: (row) => (
                <span className="text-muted-foreground">
          {row.email ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: (row) => (
                <span className="max-w-[200px] truncate block" title={row.address ?? ''}>
          {row.address ?? '-'}
        </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
          {row.status === 1 ? 'Aktif' : 'Tidak Aktif'}
        </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: (row: Client) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4"/>
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleViewAreas(row)}>
                                <MapPin className="h-4 w-4 mr-2"/>
                                Lihat Areas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onSelect={() => handleViewMou(row)}>
                                <Eye className="h-4 w-4 mr-2"/>
                                Lihat MOU
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ]

    // Bulk actions
    const bulkActions = (
        <div className="flex gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedIds.size === 0}
            >
                <Trash2 className="h-4 w-4 mr-1"/>
                Delete Selected
            </Button>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <ClientsFilters/>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1"/>
                    Add Client
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={items}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                emptyMessage="No clients found"
                enableRowSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={bulkActions}
                onRowClick={handleEdit}
            />

            {/* MOU View Modal */}
            <AlertDialog open={showMouModal} onOpenChange={setShowMouModal}>
                <AlertDialogContent className="max-w-2xl"
                                    style={{width: '600px', maxWidth: '95vw'}}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5"/>
                            MOU - {mouData?.client?.name || 'Client'}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {mouLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Memuat...</div>
                        ) : mouData ? (
                            <div className="space-y-4">
                                {/* MOU Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">No. MOU:</span>
                                        <span className="ml-2 font-medium">#{mouData.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tanggal:</span>
                                        <span className="ml-2">{formatDate(mouData.date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Periode:</span>
                                        <span
                                            className="ml-2">{formatDate(mouData.start_date)} - {mouData.end_date ? formatDate(mouData.end_date) : 'ongoing'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Fee Bulanan:</span>
                                        <span
                                            className="ml-2 font-medium">Rp {Number(mouData.monthly_fee || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Shifts */}
                                <div>
                                    <h4 className="font-medium mb-2">Shift ({mouData.shifts?.length || 0})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {mouData.shifts && mouData.shifts.length > 0 ? (
                                            mouData.shifts.map((shift) => (
                                                <span key={shift.id}
                                                      className="px-3 py-1 bg-muted rounded-full text-sm">
                                                    {shift.name}: {shift.start_time} - {shift.end_time}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Tidak ada shift</span>
                                        )}
                                    </div>
                                </div>

                                {/* Personnel */}
                                <div>
                                    <h4 className="font-medium mb-2">Personnel ({mouData.personnel?.length || 0})</h4>
                                    <div className="space-y-1">
                                        {mouData.personnel && mouData.personnel.length > 0 ? (
                                            mouData.personnel.map((p) => (
                                                <div key={p.id} className="flex justify-between items-center text-sm">
                                                    <span className="font-medium">{p.role?.name || '-'}</span>
                                                    <span className="text-muted-foreground">× {p.quantity} orang</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Tidak ada personnel</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50"/>
                                <p className="text-muted-foreground">Client ini belum memiliki MOU</p>
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => setShowMouModal(false)}
                                className="flex-1 h-10 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            >
                                Tutup
                            </button>
                            {mouData ? (
                                <button
                                    onClick={() => {
                                        const url = `${import.meta.env.VITE_API_URL || ''}/api/admin/mou/${mouData.id}/pdf`
                                        window.open(url, '_blank')
                                    }}
                                    className="flex-1 h-10 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Download PDF
                                </button>
                            ) : mouViewClient && (
                                <button
                                    onClick={() => {
                                        setShowMouModal(false)
                                        setMouCreateClient(mouViewClient)
                                        setShowMouCreate(true)
                                    }}
                                    className="flex-1 h-10 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Buat MOU
                                </button>
                            )}
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* MOU Create Wizard Modal */}
            <MouWizardModal
                open={showMouCreate}
                onOpenChange={setShowMouCreate}
                clientId={mouCreateClient?.id}
                clientName={mouCreateClient?.name}
                onSuccess={handleMouCreateSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedIds.size} client yang dipilih? Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting || isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
