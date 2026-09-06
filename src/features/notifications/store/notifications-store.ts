import { create } from 'zustand'
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


export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isPanelOpen: false,
  lastFetchTime: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await notificationsApi.getList()
      const oldIds = new Set(get().notifications.map(n => n.id))
      const newNotifications = result.notifications
      
      // Find new notifications
      const newOnes = newNotifications.filter(n => !oldIds.has(n.id))
      
      set({
        notifications: newNotifications,
        unreadCount: result.unread_count,
        isLoading: false,
        lastFetchTime: Date.now(),
      })
      
      // Show toast for new notifications
      if (newOnes.length > 0) {
        newOnes.forEach(notif => {
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
  }),

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
    toast(notification.title, {
      description: notification.body,
      duration: 5000,
    })
  },
}))
