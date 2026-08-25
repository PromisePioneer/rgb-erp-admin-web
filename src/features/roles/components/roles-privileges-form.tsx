/**
 * Roles Privileges Form Component
 * Manage privileges for a specific role
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { rolesApi } from '../api/roles-api'
import type { PrivilegeChild, PrivilegeGroup } from '../types/roles-privileges.types'

interface RolesPrivilegesFormProps {
  roleId: number
}

export function RolesPrivilegesForm({ roleId }: RolesPrivilegesFormProps) {
  const navigate = useNavigate()

  const [privileges, setPrivileges] = useState<PrivilegeGroup[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for checkboxes
  const [checkedPrivileges, setCheckedPrivileges] = useState<Record<number, boolean>>({})
  const [checkedChildren, setCheckedChildren] = useState<Record<number, Record<number, boolean>>>({})

  // Fetch privileges on mount
  useEffect(() => {
    const fetchPrivileges = async () => {
      setIsLoading(true)
      try {
        const response = await rolesApi.getPrivileges(roleId)
        setPrivileges(response.data.privileges)
        setRoleName(response.data.role_name)

        // Initialize checked state
        const parentChecked: Record<number, boolean> = {}
        const childChecked: Record<number, Record<number, boolean>> = {}

        response.data.privileges.forEach((group: PrivilegeGroup) => {
          parentChecked[group.id] = group.has_privilege
          childChecked[group.id] = {}
          group.children.forEach((child: PrivilegeChild) => {
            childChecked[group.id][child.id] = child.has_privilege
          })
        })

        setCheckedPrivileges(parentChecked)
        setCheckedChildren(childChecked)
      } catch (error) {
        toast.error('Failed to load privileges')
        navigate({ to: '/roles' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivileges()
  }, [roleId, navigate])

  // Handle parent checkbox change
  const handleParentChange = useCallback((groupId: number, checked: boolean) => {
    setCheckedPrivileges(prev => ({ ...prev, [groupId]: checked }))
    // Also check/uncheck all children
    const group = privileges.find(g => g.id === groupId)
    if (group) {
      setCheckedChildren(prev => ({
        ...prev,
        [groupId]: Object.fromEntries(group.children.map(c => [c.id, checked]))
      }))
    }
  }, [privileges])

  // Handle child checkbox change
  const handleChildChange = useCallback((groupId: number, childId: number, checked: boolean) => {
    setCheckedChildren(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [childId]: checked
      }
    }))

    // Check if all children are checked
    const group = privileges.find(g => g.id === groupId)
    if (group) {
      const allChildrenChecked = group.children.every(
        c => c.id === childId ? checked : (checkedChildren[groupId]?.[c.id] ?? false)
      )
      setCheckedPrivileges(prev => ({ ...prev, [groupId]: allChildrenChecked }))
    }
  }, [privileges, checkedChildren])

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Build payload
      const payload = {
        privileges: [] as { id: number; has_privilege: boolean }[]
      }

      privileges.forEach(group => {
        // Add parent privilege
        payload.privileges.push({
          id: group.id,
          has_privilege: checkedPrivileges[group.id] ?? false
        })

        // Add children privileges
        group.children.forEach(child => {
          payload.privileges.push({
            id: child.id,
            has_privilege: checkedChildren[group.id]?.[child.id] ?? false
          })
        })
      })

      await rolesApi.updatePrivileges(roleId, payload)
      toast.success('Privileges updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update privileges')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
            Hak Akses Role
          </h2>
          <p className="text-muted-foreground">
            Kelola hak akses untuk role: <strong>{roleName}</strong>
          </p>
        </div>
      </div>

      {/* Privileges List */}
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
