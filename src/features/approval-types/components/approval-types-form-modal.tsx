/**
 * Approval Types Form Modal Component
 */
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {useApprovalTypesStore} from '../store/approval-types-store'
import type {ApprovalType} from '../types/approval-types.types'
import {toast} from 'sonner'

interface ApprovalTypesFormModalProps {
    type: ApprovalType | null
    onClose: () => void
}

export function ApprovalTypesFormModal({type, onClose}: ApprovalTypesFormModalProps) {
    const {saveType, isSubmitting} = useApprovalTypesStore()

    const [formData, setFormData] = useState({
        type: '',
        name: '',
        is_active: true,
    })

    useEffect(() => {
        if (type) {
            setFormData({
                type: type.type,
                name: type.name,
                is_active: type.is_active,
            })
        } else {
            setFormData({
                type: '',
                name: '',
                is_active: true,
            })
        }
    }, [type])

    const handleSubmit = async () => {
        if (!formData.type || !formData.name) {
            toast.error('Type code and name are required')
            return
        }

        // Normalize type to snake_case
        const normalizedType = formData.type
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')

        try {
            if (type) {
                await saveType({
                    name: formData.name,
                    is_active: formData.is_active,
                }, type.id)
                toast.success('Type updated successfully')
            } else {
                await saveType({
                    type: normalizedType,
                    name: formData.name,
                    is_active: formData.is_active,
                })
                toast.success('Type created successfully')
            }
            onClose()
        } catch {
            toast.error(`Failed to ${type ? 'update' : 'create'} type`)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{type ? 'Edit' : 'Add'} Approval Type</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type Code</Label>
                        <Input
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            placeholder="e.g., leave_request"
                            disabled={!!type}
                        />
                        <p className="text-xs text-muted-foreground">
                            Unique identifier. Use snake_case. Cannot be changed after creation.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Leave Request"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Active</Label>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
