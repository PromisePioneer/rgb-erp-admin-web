import { apiClient } from '@/lib/api-client'
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from '../types/notifications.types'

export const notificationsApi = {
  getList: async (params?: { limit?: number; offset?: number }): Promise<NotificationListResponse> => {
    const { data } = await apiClient.get<NotificationListResponse>('/admin/notifications', { params })
    return data
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<UnreadCountResponse>('/admin/notifications/unread-count')
    return data.unread_count
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post<MarkAsReadResponse>(`/admin/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<number> => {
    const { data } = await apiClient.post<MarkAllAsReadResponse>('/admin/notifications/read-all')
    return data.count
  },

  getNotificationUrl(notification: Notification): string {
    const { type } = notification

    switch (type) {
      case 'approval_request':
      case 'request_approved':
      case 'request_rejected':
        return '/approvals'
      case 'patrol_alarm':
        return '/patrol-report'
      case 'shift_reminder':
        return '/attendance'
      case 'backup_offer':
      case 'backup_assigned':
      case 'backup_escalation':
        return '/schedules'
      case 'task_assigned':
      case 'task_started':
      case 'task_completed':
      case 'task_reviewed':
        return '/daily-task'
      default:
        return '/dashboard'
    }
  },
}
