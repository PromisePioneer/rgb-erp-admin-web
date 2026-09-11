/**
 * Approval Flows Form Modal Component
 * Configure approval steps for an approval type
 */
import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useApprovalTypesStore } from '../store/approval-types-store'
import type { ApprovalStep } from '../types/approval-types.types'
import { toast } from 'sonner'

interface ApprovalFlowsFormModalProps {
  typeId: number
  onClose: () => void
}

export function ApprovalFlowsFormModal({ typeId, onClose }: ApprovalFlowsFormModalProps) {
  const { selectedType, fetchTypeById, saveType, fetchRolesOptions, fetchEmployeesOptions, rolesOptions, employeesOptions, isSubmitting } = useApprovalTypesStore()
  const [steps, setSteps] = useState<ApprovalStep[]>([])

  useEffect(() => {
    fetchTypeById(typeId)
    fetchRolesOptions()
    fetchEmployeesOptions()
  }, [typeId, fetchTypeById, fetchRolesOptions, fetchEmployeesOptions])

  useEffect(() => {
    if (selectedType?.steps_summary) {
      setSteps(selectedType.steps_summary)
    }
  }, [selectedType])

  const handleAddStep = () => {
    const newLevel = steps.length + 1
    setSteps([
      ...steps,
      {
        level: newLevel,
        approver_kind: 'role',
        approver_id: 0,
      },
    ])
  }

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    // Re-number levels
    setSteps(newSteps.map((step, i) => ({ ...step, level: i + 1 })))
  }

  const handleStepChange = (index: number, field: keyof ApprovalStep, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleSave = async () => {
    // Validate
    for (const step of steps) {
      if (!step.approver_id) {
        toast.error('Please select an approver for all steps')
        return
      }
    }

    try {
      await saveType(
        {
          type: selectedType?.type || '',
          name: selectedType?.name || '',
          is_active: selectedType?.is_active,
          steps: steps.map(s => ({
            level: s.level,
            approver_kind: s.approver_kind,
            approver_id: s.approver_id,
          })),
        },
        typeId
      )
      toast.success('Approval flow saved successfully')
      onClose()
    } catch {
      toast.error('Failed to save approval flow')
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Approval Flow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {selectedType && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedType.name}</p>
              <p className="text-sm text-muted-foreground">Type: {selectedType.type}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Approval Steps</Label>
              <Button variant="outline" size="sm" onClick={handleAddStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No approval steps configured.</p>
                <p className="text-sm">Click "Add Step" to add approval steps.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-card border rounded-lg"
                  >
                    <GripVertical className="h-5 w-5 mt-6 text-muted-foreground cursor-grab" />

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Level</Label>
                        <div className="p-2 bg-muted rounded text-center font-medium">
                          {step.level}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Approver Type</Label>
                        <Select
                          value={step.approver_kind}
                          onValueChange={(value) => handleStepChange(index, 'approver_kind', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="role">Role</SelectItem>
                            <SelectItem value="user">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs">
                          {step.approver_kind === 'role' ? 'Role' : 'Employee'}
                        </Label>
                        <Select
                          value={step.approver_id ? step.approver_id.toString() : ''}
                          onValueChange={(value) => value && handleStepChange(index, 'approver_id', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {step.approver_kind === 'role' ? (
                              rolesOptions.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))
                            ) : (
                              employeesOptions.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                  {emp.name} - {emp.role_name || 'No Role'}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive mt-6"
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Flow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
