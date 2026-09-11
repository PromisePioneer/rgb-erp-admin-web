import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { notificationsApi } from '../api/notifications-api'
import type { Notification } from '../types/notifications.types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  isPanelOpen: boolean
  lastFetchTime: number | null
  notifiedIds: number[] // Track IDs that have already shown toast (persisted)

  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  reset: () => void
  addNotification: (notification: Notification) => void
}

// Helper to check if notification is truly new (from last 30 seconds)
const isRecentlyCreated = (notification: Notification): boolean => {
  if (!notification.created_at) return false
  const createdAt = new Date(notification.created_at).getTime()
  const thirtySecondsAgo = Date.now() - 30000
  return createdAt > thirtySecondsAgo
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      isPanelOpen: false,
      lastFetchTime: null,
      notifiedIds: [],

      fetchNotifications: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await notificationsApi.getList()
          const notifiedIds = get().notifiedIds
          const newNotifications = result.notifications

          // Find notifications that are BOTH:
          // 1. Not yet notified (no toast shown)
          // 2. Unread
          // 3. Created recently (within last 30 seconds) - to avoid old notifications triggering toast
          const newOnes = newNotifications.filter(n =>
            !notifiedIds.includes(n.id) &&
            !n.read_at &&
            isRecentlyCreated(n)
          )

          // Update notified IDs
          const updatedNotifiedIds = [...notifiedIds]
          newOnes.forEach(n => {
            if (!updatedNotifiedIds.includes(n.id)) {
              updatedNotifiedIds.push(n.id)
            }
          })

          set({
            notifications: newNotifications,
            unreadCount: result.unread_count,
            isLoading: false,
            lastFetchTime: Date.now(),
            notifiedIds: updatedNotifiedIds,
          })

          // Show toast for truly NEW notifications
          if (newOnes.length > 0) {
            newOnes.slice(0, 3).forEach(notif => { // Limit to 3 toasts max
              toast(notif.title, {
                description: notif.body,
                duration: 5000,
              })
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch',
            isLoading: false,
          })
        }
      },

      fetchUnreadCount: async () => {
        try {
          const count = await notificationsApi.getUnreadCount()
          set({ unreadCount: count })
        } catch {
          // Silent fail
        }
      },

      markAsRead: async (id: number) => {
        try {
          await notificationsApi.markAsRead(id)
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed' })
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationsApi.markAllAsRead()
          set((state) => ({
            notifications: state.notifications.map(n => ({
              ...n,
              read_at: n.read_at || new Date().toISOString(),
            })),
            unreadCount: 0,
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed' })
        }
      },

      openPanel: () => {
        set({ isPanelOpen: true })
        get().fetchNotifications()
      },

      closePanel: () => set({ isPanelOpen: false }),

      togglePanel: () => {
        if (get().isPanelOpen) {
          get().closePanel()
        } else {
          get().openPanel()
        }
      },

      reset: () => set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        isPanelOpen: false,
        lastFetchTime: null,
        notifiedIds: [],
      }),

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
          notifiedIds: [...state.notifiedIds, notification.id],
        }))
        toast(notification.title, {
          description: notification.body,
          duration: 5000,
        })
      },
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({ notifiedIds: state.notifiedIds }),
    }
  )
)
