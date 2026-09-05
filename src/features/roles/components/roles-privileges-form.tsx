/**
 * Roles Privileges Form Component
 * Manage web privileges AND mobile privileges for a specific role
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Shield, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { rolesApi } from '../api/roles-api'
import type { PrivilegeChild, PrivilegeGroup } from '../types/roles-privileges.types'
import type { MobilePrivilege } from '../types/role-mobile-privileges.types'

interface RolesPrivilegesFormProps {
  roleId: number
}

export function RolesPrivilegesForm({ roleId }: RolesPrivilegesFormProps) {
  const navigate = useNavigate()

  // Web Privileges State
  const [privileges, setPrivileges] = useState<PrivilegeGroup[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Mobile Privileges State
  const [mobilePrivileges, setMobilePrivileges] = useState<MobilePrivilege[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for web privilege checkboxes
  const [checkedPrivileges, setCheckedPrivileges] = useState<Record<number, boolean>>({})
  const [checkedChildren, setCheckedChildren] = useState<Record<number, Record<number, boolean>>>({})

  // Local state for mobile privilege checkboxes
  const [checkedMobilePrivileges, setCheckedMobilePrivileges] = useState<Record<number, boolean>>({})

  // Fetch all privileges on mount
  useEffect(() => {
    const fetchPrivileges = async () => {
      setIsLoading(true)
      try {
        // Fetch web privileges
        const webResponse = await rolesApi.getPrivileges(roleId)
        setPrivileges(webResponse.data.privileges)
        setRoleName(webResponse.data.role_name)

        // Initialize web privilege checked state
        const parentChecked: Record<number, boolean> = {}
        const childChecked: Record<number, Record<number, boolean>> = {}

        webResponse.data.privileges.forEach((group: PrivilegeGroup) => {
          parentChecked[group.id] = group.has_privilege
          childChecked[group.id] = {}
          group.children.forEach((child: PrivilegeChild) => {
            childChecked[group.id][child.id] = child.has_privilege
          })
        })

        setCheckedPrivileges(parentChecked)
        setCheckedChildren(childChecked)

        // Fetch mobile privileges
        const mobileResponse = await rolesApi.getMobilePrivileges(roleId)
        setMobilePrivileges(mobileResponse.data.mobile_privileges)

        // Initialize mobile privilege checked state
        const mobileChecked: Record<number, boolean> = {}
        mobileResponse.data.mobile_privileges.forEach((p: MobilePrivilege) => {
          mobileChecked[p.id] = p.has_privilege
        })
        setCheckedMobilePrivileges(mobileChecked)

      } catch (error) {
        toast.error('Failed to load privileges')
        navigate({ to: '/roles' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivileges()
  }, [roleId, navigate])

  // Handle web parent checkbox change
  const handleParentChange = useCallback((groupId: number, checked: boolean) => {
    setCheckedPrivileges(prev => ({ ...prev, [groupId]: checked }))
    const group = privileges.find(g => g.id === groupId)
    if (group) {
      setCheckedChildren(prev => ({
        ...prev,
        [groupId]: Object.fromEntries(group.children.map(c => [c.id, checked]))
      }))
    }
  }, [privileges])

  // Handle web child checkbox change
  const handleChildChange = useCallback((groupId: number, childId: number, checked: boolean) => {
    setCheckedChildren(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [childId]: checked
      }
    }))

    const group = privileges.find(g => g.id === groupId)
    if (group) {
      const allChildrenChecked = group.children.every(
        c => c.id === childId ? checked : (checkedChildren[groupId]?.[c.id] ?? false)
      )
      setCheckedPrivileges(prev => ({ ...prev, [groupId]: allChildrenChecked }))
    }
  }, [privileges, checkedChildren])

  // Handle mobile privilege checkbox change
  const handleMobilePrivilegeChange = useCallback((privilegeId: number, checked: boolean) => {
    setCheckedMobilePrivileges(prev => ({ ...prev, [privilegeId]: checked }))
  }, [])

  // Handle submit all privileges
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Build web privileges payload
      const webPayload = {
        privileges: [] as { id: number; has_privilege: boolean }[]
      }

      privileges.forEach(group => {
        webPayload.privileges.push({
          id: group.id,
          has_privilege: checkedPrivileges[group.id] ?? false
        })
        group.children.forEach(child => {
          webPayload.privileges.push({
            id: child.id,
            has_privilege: checkedChildren[group.id]?.[child.id] ?? false
          })
        })
      })

      // Build mobile privileges payload
      const mobilePayload = {
        mobile_privileges: mobilePrivileges.map(p => ({
          id: p.id,
          has_privilege: checkedMobilePrivileges[p.id] ?? false
        }))
      }

      // Update both
      await Promise.all([
        rolesApi.updatePrivileges(roleId, webPayload),
        rolesApi.updateMobilePrivileges(roleId, mobilePayload)
      ])

      toast.success('All privileges updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update privileges')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/roles' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Kelola Hak Akses
          </h2>
          <p className="text-muted-foreground">
            Role: <strong>{roleName}</strong>
          </p>
        </div>
      </div>

      {/* Tabs for Web and Mobile Privileges */}
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="web" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Web (Admin)
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile App
          </TabsTrigger>
        </TabsList>

        {/* Web Privileges Tab */}
        <TabsContent value="web" className="mt-4">
          <div className="bg-card rounded-lg border">
            <div className="divide-y">
              {privileges.map((group) => (
                <div key={group.id} className="p-4">
                  {/* Parent Checkbox */}
                  <div className="flex items-center gap-3 pb-2">
                    <Checkbox
                      id={`parent-${group.id}`}
                      checked={checkedPrivileges[group.id] ?? false}
                      onChange={(e) => handleParentChange(group.id, e.target.checked)}
                    />
                    <label
                      htmlFor={`parent-${group.id}`}
                      className="text-sm font-bold uppercase tracking-wide cursor-pointer"
                    >
                      {group.name}
                    </label>
                  </div>

                  {/* Child Checkboxes */}
                  <div className="pl-7 space-y-2">
                    {group.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`child-${child.id}`}
                          checked={checkedChildren[group.id]?.[child.id] ?? false}
                          onChange={(e) => handleChildChange(group.id, child.id, e.target.checked)}
                        />
                        <label
                          htmlFor={`child-${child.id}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {child.feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {privileges.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No privileges found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Mobile Privileges Tab */}
        <TabsContent value="mobile" className="mt-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Pilih fitur mobile app yang dapat diakses oleh role ini.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mobilePrivileges.map((privilege) => (
                  <div key={privilege.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
                    <Checkbox
                      id={`mobile-${privilege.id}`}
                      checked={checkedMobilePrivileges[privilege.id] ?? false}
                      onChange={(e) => handleMobilePrivilegeChange(privilege.id, e.target.checked)}
                    />
                    <label
                      htmlFor={`mobile-${privilege.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      <span className="font-medium">{privilege.name}</span>
                      <span className="text-muted-foreground ml-2">({privilege.key})</span>
                    </label>
                  </div>
                ))}
              </div>

              {mobilePrivileges.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No mobile privileges found
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={() => navigate({ to: '/roles' })}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </div>
  )
}
