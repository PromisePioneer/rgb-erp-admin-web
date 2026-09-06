import { create } from 'zustand'
import { toast } from 'sonner'
import echo from '@/lib/echo'
import type { Notification } from '../types/notifications.types'
import { notificationsApi } from '../api/notifications-api'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  isPanelOpen: boolean
  isConnected: boolean
  employeeId: number | null

  // Actions
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  reset: () => void
  initReverb: (employeeId: number) => void
  disconnectReverb: () => void
  addRealtimeNotification: (notification: Notification) => void
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isPanelOpen: false,
  isConnected: false,
  employeeId: null,
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  ...initialState,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await notificationsApi.getList()
      set({
        notifications: result.notifications,
        unreadCount: result.unread_count,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false,
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      set({ unreadCount: count })
    } catch {
      // Silently fail for count refresh
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)

      // Update local state
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
      const unreadCount = Math.max(0, get().unreadCount - 1)

      set({ notifications, unreadCount })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      })
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead()

      // Update local state - mark all as read
      const notifications = get().notifications.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString(),
      }))

      set({ notifications, unreadCount: 0 })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
      })
    }
  },

  openPanel: () => {
    set({ isPanelOpen: true })
    // Fetch notifications when opening panel
    get().fetchNotifications()
  },

  closePanel: () => {
    set({ isPanelOpen: false })
  },

  togglePanel: () => {
    if (get().isPanelOpen) {
      get().closePanel()
    } else {
      get().openPanel()
    }
  },

  reset: () => {
    set(initialState)
  },

  initReverb: (employeeId: number) => {
    // Disconnect existing if any
    get().disconnectReverb()

    set({ employeeId, isConnected: false })
    console.log('Initializing Reverb for employee:', employeeId)

    // Listen to private notification channel
    echo.private(`notifications.${employeeId}`)
      .listen('.new-notification', (event: Notification) => {
        console.log('Received realtime notification:', event)
        get().addRealtimeNotification(event)
      })

    set({ isConnected: true })
    console.log('Reverb channel subscribed')
  },

  disconnectReverb: () => {
    const { employeeId } = get()
    if (employeeId) {
      console.log('Disconnecting Reverb for employee:', employeeId)
      echo.leave(`notifications.${employeeId}`)
    }
    set({ isConnected: false, employeeId: null })
  },

  addRealtimeNotification: (notification: Notification) => {
    // Add to state
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Show toast
    toast(notification.title, {
      description: notification.body,
      duration: 5000,
      action: notification.reference_type ? {
        label: 'Lihat',
        onClick: () => {
          // Navigate to reference
          console.log('Navigate to:', notification.reference_type, notification.reference_id)
        },
      } : undefined,
    })
  },
}))
