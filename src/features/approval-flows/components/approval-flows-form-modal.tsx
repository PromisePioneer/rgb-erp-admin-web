/**
 * Approval Flows Form Modal Component
 * Edit approval flow steps
 */
import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApprovalFlowsStore } from '../store/approval-flows-store'
import type { ApprovalFlow } from '../types/approval-flows.types'
import { toast } from 'sonner'

interface ApprovalFlowsFormModalProps {
  flow: ApprovalFlow
  onClose: () => void
}

interface StepFormData {
  id?: number
  level: number
  approver_kind: 'user' | 'role'
  approver_id: number | null
}

export function ApprovalFlowsFormModal({ flow, onClose }: ApprovalFlowsFormModalProps) {
  const {
    selectedFlow,
    usersOptions,
    rolesOptions,
    fetchByType,
    fetchUsersOptions,
    fetchRolesOptions,
    updateFlow,
    isSubmitting,
  } = useApprovalFlowsStore()

  const [isActive, setIsActive] = useState(flow.is_active)
  const [steps, setSteps] = useState<StepFormData[]>([])

  useEffect(() => {
    fetchByType(flow.type)
    fetchUsersOptions()
    fetchRolesOptions()
  }, [flow.type, fetchByType, fetchUsersOptions, fetchRolesOptions])

  useEffect(() => {
    if (selectedFlow) {
      setIsActive(selectedFlow.is_active)
      setSteps(
        selectedFlow.steps.map((s) => ({
          id: s.id,
          level: s.level,
          approver_kind: s.approver_kind,
          approver_id: s.approver_id,
        }))
      )
    }
  }, [selectedFlow])

  const handleAddStep = () => {
    const newLevel = steps.length + 1
    setSteps([...steps, { level: newLevel, approver_kind: 'role', approver_id: null }])
  }

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    // Re-number levels
    setSteps(
      newSteps.map((s, i) => ({
        ...s,
        level: i + 1,
      }))
    )
  }

  const handleStepChange = (index: number, field: keyof StepFormData, value: string | number | null) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleSubmit = async () => {
    // Validate
    const validSteps = steps.filter((s) => s.approver_id !== null)
    if (validSteps.length === 0 && isActive) {
      toast.error('At least one approver step is required when flow is active')
      return
    }

    try {
      await updateFlow(flow.type, {
        is_active: isActive,
        steps: validSteps.map((s) => ({
          level: s.level,
          approver_kind: s.approver_kind,
          approver_id: s.approver_id as number,
        })),
      })
      toast.success('Approval flow updated successfully')
      onClose()
    } catch {
      toast.error('Failed to update approval flow')
    }
  }

  const getApproverOptions = (kind: 'user' | 'role') => {
    switch (kind) {
      case 'user':
        return usersOptions
      case 'role':
        return rolesOptions
      default:
        return []
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Approval Flow: {flow.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Flow Active</Label>
              <p className="text-sm text-muted-foreground">
                When active, requests require approval before being processed
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Approval Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No approval steps configured. Click "Add Step" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-card"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Level</Label>
                        <Input
                          type="number"
                          min={1}
                          value={step.level}
                          onChange={(e) =>
                            handleStepChange(index, 'level', parseInt(e.target.value) || 1)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Approver Type</Label>
                        <Select
                          value={step.approver_kind}
                          onValueChange={(value) =>
                            handleStepChange(index, 'approver_kind', value as 'user' | 'role')
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="role">Role</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Approver</Label>
                        <Select
                          value={step.approver_id?.toString() ?? ''}
                          onValueChange={(value) => {
                            if (value) {
                              const parsed = parseInt(value, 10)
                              if (!isNaN(parsed)) {
                                handleStepChange(index, 'approver_id', parsed)
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select approver" />
                          </SelectTrigger>
                          <SelectContent>
                            {getApproverOptions(step.approver_kind).map((opt) => (
                              <SelectItem key={opt.id} value={String(opt.id)}>
                                {opt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive mt-1"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
