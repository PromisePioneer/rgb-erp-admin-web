import { useAuthStore } from '@/stores/auth-store'

export type PrivilegeAction = 'View' | 'Add' | 'Edit' | 'Delete' | 'Generate'

/**
 * Check if current user has privilege for menu + action
 * Format: "MenuName,Action" e.g. "Bank,View"
 * Use this inside React components (hook version)
 */
export function useCanAccess(menu: string, action: PrivilegeAction): boolean {
  const { privileges } = useAuthStore()
  return privileges.includes(`${menu},${action}`)
}

/**
 * Require privilege - throws if unauthorized
 * Use this inside React components (hook version)
 */
export function requirePrivilege(menu: string, action: PrivilegeAction): void {
  const { privileges } = useAuthStore()
  if (!privileges.includes(`${menu},${action}`)) {
    throw new Error('Unauthorized')
  }
}

/**
 * Check privilege without hooks - for use in beforeLoad callbacks
 * Use this inside beforeLoad, event handlers, or non-React code
 */
export function checkPrivilege(menu: string, action: PrivilegeAction): boolean {
  const { privileges } = useAuthStore.getState()
  return privileges.includes(`${menu},${action}`)
}

/**
 * Require privilege without hooks - for use in beforeLoad callbacks
 * Use this inside beforeLoad, event handlers, or non-React code
 */
export function requirePrivilegeInBeforeLoad(menu: string, action: PrivilegeAction): void {
  const { privileges } = useAuthStore.getState()
  if (!privileges.includes(`${menu},${action}`)) {
    throw new Error('Unauthorized')
  }
}

/**
 * Check if user can view a menu (has any action on it)
 */
export function canViewMenu(menu: string): boolean {
  const { privileges } = useAuthStore.getState()
  return privileges.some((p) => p.startsWith(`${menu},`))
}
