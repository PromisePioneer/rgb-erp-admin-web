import { apiClient } from '@/lib/api-client'
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from '../types/notifications.types'

export const notificationsApi = {
  /**
   * Get notifications list
   */
  getList: async (params?: { limit?: number; offset?: number }): Promise<NotificationListResponse> => {
    const { data } = await apiClient.get<NotificationListResponse>('/admin/notifications', {
      params,
    })
    return data
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<UnreadCountResponse>('/admin/notifications/unread-count')
    return data.unread_count
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post<MarkAsReadResponse>(`/admin/notifications/${id}/read`)
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<number> => {
    const { data } = await apiClient.post<MarkAllAsReadResponse>('/admin/notifications/read-all')
    return data.count
  },

  /**
   * Get notification URL based on type
   */
  getNotificationUrl(notification: Notification): string {
    const { type, data } = notification
    const dataRecord = data as Record<string, unknown>

    switch (type) {
      case 'approval_request':
      case 'request_approved':
      case 'request_rejected': {
        const approvalId = dataRecord?.approval_id
        return approvalId ? `/features/approvals/${approvalId}/edit` : '/features/approvals'
      }
      case 'patrol_alarm':
        return '/patrol'
      case 'shift_reminder':
        return '/attendance'
      case 'backup_offer':
      case 'backup_assigned':
      case 'backup_escalation': {
        const scheduleId = dataRecord?.schedule_id
        return scheduleId ? `/schedules/${scheduleId}` : '/schedules'
      }
      case 'task_assigned':
      case 'task_started':
      case 'task_completed':
      case 'task_reviewed': {
        const taskId = dataRecord?.task_id
        return taskId ? `/daily-task/${taskId}` : '/daily-task'
      }
      default:
        return '/dashboard'
    }
  },
}
