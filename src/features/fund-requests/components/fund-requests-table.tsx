import { useEffect } from 'react'
// @ts-ignore
import { useNavigate } from '@tanstack/react-router'
import { Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFundRequestsStore } from '../store/fund-requests-store'
import { toast } from 'sonner'

export function FundRequestsTable() {
  const navigate = useNavigate()
  const store = useFundRequestsStore()

  useEffect(() => {
    store.fetchFundRequests()
  }, [])

  const handleSubmit = async (id: number) => {
    try {
      await store.submitForApproval(id)
      toast.success('Submitted for approval')
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    }
  }

  const statusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate({ to: '/fund-requests/new' })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fund Request
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">PO</th>
              <th className="px-4 py-3 text-left font-medium">Vendor</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.isLoading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : store.items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No fund requests</td></tr>
            ) : store.items.map(fr => (
              <tr key={fr.id} className="border-t">
                <td className="px-4 py-3 font-mono">{fr.code}</td>
                <td className="px-4 py-3 text-muted-foreground">{fr.po_code || '-'}</td>
                <td className="px-4 py-3">{fr.vendor_name || '-'}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(fr.requested_amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass(fr.status)}`}>{fr.status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {fr.can_submit && (
                    <Button size="sm" variant="outline" onClick={() => handleSubmit(fr.id)} disabled={store.isSubmitting}>
                      <Send className="h-4 w-4 mr-1" />
                      Submit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {store.pagination.total} | Page {store.pagination.current_page} of {store.pagination.last_page}
      </div>
    </div>
  )
}
