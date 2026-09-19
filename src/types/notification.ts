export interface Notification {
  id: number
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  reference_type?: string
  reference_id?: number
  read_at?: string | null
  created_at: string
}

export interface NewNotificationEvent {
  id: number
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  reference_type?: string
  reference_id?: number
  created_at: string
}
