// Chart of Accounts API
import { apiClient } from '@/lib/api-client'
import type { Account, AccountFormData, AccountFilters } from '../types/account.types'

export async function getAccounts(filters?: AccountFilters): Promise<Account[]> {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.search) params.set('search', filters.search)

  const { data } = await apiClient.get(`/admin/accounts?${params}`)
  return data.data
}

export async function getAccount(id: number): Promise<Account> {
  const { data } = await apiClient.get(`/admin/accounts/${id}`)
  return data.data
}

export async function createAccount(payload: AccountFormData): Promise<Account> {
  const { data } = await apiClient.post('/admin/accounts', payload)
  return data.data
}

export async function updateAccount(id: number, payload: Partial<AccountFormData>): Promise<Account> {
  const { data } = await apiClient.put(`/admin/accounts/${id}`, payload)
  return data.data
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient.delete(`/admin/accounts/${id}`)
}

export async function bulkDeleteAccounts(ids: number[]): Promise<void> {
  await apiClient.post('/admin/accounts/bulk-delete', { ids })
}
