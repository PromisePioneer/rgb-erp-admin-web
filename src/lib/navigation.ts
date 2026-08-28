/**
 * SPA Navigation Helper
 * Use this for navigation without page reload
 */
import { router } from '@/routes/__root'

/**
 * Navigate to a route (SPA navigation - no page reload)
 */
export function navigateTo(path: string): void {
  router.history.push(path)
}

/**
 * Navigate back to positions list
 */
export function navigateToPositions(): void {
  router.history.push('/positions')
}

/**
 * Navigate to position privileges page
 */
export function navigateToPositionPrivileges(positionId: number): void {
  router.history.push(`/positions/${positionId}/privileges`)
}
