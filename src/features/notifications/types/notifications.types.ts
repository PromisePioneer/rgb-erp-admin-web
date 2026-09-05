export interface Notification {
  id: number;
  employee_id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  reference_type: string | null;
  reference_id: number | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkAsReadResponse {
  message: string;
}

export interface MarkAllAsReadResponse {
  message: string;
  count: number;
}

export type NotificationType =
  | 'approval_request'
  | 'request_approved'
  | 'request_rejected'
  | 'patrol_alarm'
  | 'shift_reminder'
  | 'backup_offer'
  | 'backup_assigned'
  | 'backup_escalation'
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'task_reviewed'
  | 'general';

export interface NotificationFilters {
  type?: string;
  read?: boolean;
}
