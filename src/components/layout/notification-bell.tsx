import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotificationsStore } from '@/features/notifications/store/notifications-store'
import { NotificationPanel } from '@/features/notifications/components/notification-panel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationBell() {
  const { unreadCount, fetchUnreadCount } = useNotificationsStore()

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationPanel />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
