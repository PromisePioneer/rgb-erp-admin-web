import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useNotificationsStore } from '../store/notifications-store'
import { NotificationItem } from './notification-item'

export function NotificationPanel() {
  const { notifications, unreadCount, isLoading, markAllAsRead } = useNotificationsStore()

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <div className="w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            title="Tandai semua sudah dibaca"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              window.location.href = '/notifications'
            }}
            className="w-full py-2 text-sm text-primary hover:text-primary hover:bg-accent rounded-md transition-colors"
          >
            Lihat semua notifikasi
          </button>
        </div>
      )}
    </div>
  )
}
