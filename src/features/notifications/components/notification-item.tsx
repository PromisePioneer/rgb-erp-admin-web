import { Bell, CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight, ClipboardCheck, PlayCircle, Star, AlertCircle, ArrowLeftRight } from 'lucide-react'
import type { Notification } from '../types/notifications.types'
import { notificationsApi } from '../api/notifications-api'

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const isRead = notification.read_at !== null

  const handleClick = () => {
    const url = notificationsApi.getNotificationUrl(notification)
    window.location.href = url
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isRead
          ? 'hover:bg-accent'
          : 'bg-accent border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
            {notification.title}
          </p>
          {!isRead && (
            <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(notification.created_at)}</p>
      </div>
      <ArrowRight className="flex-shrink-0 w-4 h-4 text-muted-foreground mt-1" />
    </div>
  )
}

function getIcon(type: string) {
  const iconClass = 'w-5 h-5'

  switch (type) {
    case 'approval_request':
      return <ClipboardCheck className={`${iconClass} text-blue-500`} />
    case 'request_approved':
      return <CheckCircle className={`${iconClass} text-green-500`} />
    case 'request_rejected':
      return <XCircle className={`${iconClass} text-destructive`} />
    case 'patrol_alarm':
      return <AlertTriangle className={`${iconClass} text-orange-500`} />
    case 'shift_reminder':
      return <Clock className={`${iconClass} text-purple-500`} />
    case 'backup_offer':
    case 'backup_assigned':
      return <ArrowLeftRight className={`${iconClass} text-amber-500`} />
    case 'backup_escalation':
      return <AlertCircle className={`${iconClass} text-destructive`} />
    case 'task_assigned':
      return <ClipboardCheck className={`${iconClass} text-blue-500`} />
    case 'task_started':
      return <PlayCircle className={`${iconClass} text-blue-500`} />
    case 'task_completed':
      return <CheckCircle className={`${iconClass} text-green-500`} />
    case 'task_reviewed':
      return <Star className={`${iconClass} text-amber-500`} />
    default:
      return <Bell className={`${iconClass} text-muted-foreground`} />
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
