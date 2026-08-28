/**
 * Status API Module
 * Returns standard Active/Inactive status options
 */
import type { StatusOption } from '../types/status.types'

// Static status options - no backend call needed
const STATUS_OPTIONS: StatusOption[] = [
  { id: 1, name: 'Active', code: 'active' },
  { id: 0, name: 'Inactive', code: 'inactive' },
]

export const statusApi = {
  /**
   * Get status options for select dropdown
   * Returns static Active/Inactive options
   */
  getSelectOptions: async (search?: string): Promise<StatusOption[]> => {
    // Simulate network delay for consistent UX
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!search) return STATUS_OPTIONS

    // Filter based on search term
    const lowerSearch = search.toLowerCase()
    return STATUS_OPTIONS.filter(
      (status) =>
        status.name.toLowerCase().includes(lowerSearch) ||
        status.code?.toLowerCase().includes(lowerSearch)
    )
  },
}
