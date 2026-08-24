import { useAuthStore } from '@/stores/auth-store'

export type PrivilegeAction = 'View' | 'Add' | 'Edit' | 'Delete' | 'Generate'

/**
 * Check if current user has privilege for menu + action
 * Format: "MenuName,Action" e.g. "Bank,View"
 */
export function useCanAccess(menu: string, action: PrivilegeAction): boolean {
  const { privileges } = useAuthStore()
  return privileges.includes(`${menu},${action}`)
}

/**
 * Require privilege - throws if unauthorized
 */
export function requirePrivilege(menu: string, action: PrivilegeAction): void {
  const { privileges } = useAuthStore()
  if (!privileges.includes(`${menu},${action}`)) {
    throw new Error('Unauthorized')
  }
}

/**
 * Check if user can view a menu (has any action on it)
 */
export function canViewMenu(menu: string): boolean {
  const { privileges } = useAuthStore()
  return privileges.some((p) => p.startsWith(`${menu},`))
}
