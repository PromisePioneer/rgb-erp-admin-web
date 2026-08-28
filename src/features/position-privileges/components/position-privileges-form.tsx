/**
 * Position Privileges Form Component
 * Manage mobile privileges for a position
 */
import { useEffect, useState } from 'react'
import { ArrowLeft, Shield, Smartphone, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePositionPrivilegesStore } from '../store/position-privileges-store'
import { navigateToPositions } from '@/lib/navigation'

export function PositionPrivilegesForm() {
  // Get position ID from URL path: /positions/{id}/privileges
  const pathParts = window.location.pathname.split('/')
  const positionIdIndex = pathParts.indexOf('positions') + 1
  const positionId = Number(pathParts[positionIdIndex])

  const {
    position,
    mobilePrivileges,
    privilegeStatus,
    isLoading,
    isSubmitting,
    fetchPrivileges,
    updatePrivileges,
  } = usePositionPrivilegesStore()

  const [hasChanges, setHasChanges] = useState(false)
  const [localStatus, setLocalStatus] = useState<Record<number, number>>({})

  // Fetch privileges on mount
  useEffect(() => {
    if (positionId) {
      fetchPrivileges(positionId)
    }
  }, [positionId, fetchPrivileges])

  // Sync local status with store
  useEffect(() => {
    setLocalStatus(privilegeStatus)
    setHasChanges(false)
  }, [privilegeStatus])

  // Track changes
  useEffect(() => {
    const changed = Object.keys(localStatus).some(
      (key) => localStatus[Number(key)] !== privilegeStatus[Number(key)]
    )
    setHasChanges(changed)
  }, [localStatus, privilegeStatus])

  const handleToggle = (privilegeId: number) => {
    const currentStatus = localStatus[privilegeId] || 0
    const newStatus = currentStatus === 1 ? 0 : 1

    setLocalStatus({
      ...localStatus,
      [privilegeId]: newStatus,
    })
  }

  const handleSave = async () => {
    try {
      const payload = { privilege: localStatus }
      await updatePrivileges(positionId, payload)
      toast.success('Privileges updated successfully')
      setHasChanges(false)
    } catch {
      toast.error('Failed to update privileges')
    }
  }

  const handleBack = () => {
    navigateToPositions()
  }

  // Calculate active privileges for preview
  const activePrivileges = mobilePrivileges.filter(
    (p) => localStatus[p.id] === 1
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Position not found</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Positions
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mobile Privileges</h1>
          <p className="text-muted-foreground">
            {position.name} — atur akses fitur mobile
          </p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* Privileges Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Feature Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mobilePrivileges.map((privilege) => {
              const isActive = localStatus[privilege.id] === 1
              return (
                <label
                  key={privilege.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      isActive
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggle(privilege.id)}
                    className="rounded border-border bg-surface text-accent focus:ring-ring w-5 h-5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-ink">
                      {privilege.name}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({privilege.key})
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setLocalStatus(privilegeStatus)}
              disabled={!hasChanges || isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Preview Active Privileges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePrivileges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activePrivileges.map((privilege) => (
                <span
                  key={privilege.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  {privilege.key}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active privileges selected
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
