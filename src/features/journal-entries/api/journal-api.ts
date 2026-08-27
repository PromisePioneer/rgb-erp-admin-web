// Journal Entries API
import { apiClient } from '@/lib/api-client'
import type { JournalEntry, JournalEntryFormData, JournalFilters } from '../types/journal.types'

export async function getJournalEntries(filters?: JournalFilters): Promise<JournalEntry[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.start_date) params.set('start_date', filters.start_date)
  if (filters?.end_date) params.set('end_date', filters.end_date)
  if (filters?.period_id) params.set('period_id', filters.period_id.toString())

  const { data } = await apiClient.get(`/admin/journal-entries?${params}`)
  return data.data
}

export async function getJournalEntry(id: number): Promise<JournalEntry> {
  const { data } = await apiClient.get(`/admin/journal-entries/${id}`)
  return data.data
}

export async function createJournalEntry(payload: JournalEntryFormData): Promise<JournalEntry> {
  const { data } = await apiClient.post('/admin/journal-entries', payload)
  return data.data
}

export async function updateJournalEntry(id: number, payload: Partial<JournalEntryFormData>): Promise<JournalEntry> {
  const { data } = await apiClient.put(`/admin/journal-entries/${id}`, payload)
  return data.data
}

export async function deleteJournalEntry(id: number): Promise<void> {
  await apiClient.delete(`/admin/journal-entries/${id}`)
}

export async function postJournalEntry(id: number): Promise<JournalEntry> {
  const { data } = await apiClient.post(`/admin/journal-entries/${id}/post`)
  return data.data
}

export async function unpostJournalEntry(id: number): Promise<JournalEntry> {
  const { data } = await apiClient.post(`/admin/journal-entries/${id}/unpost`)
  return data.data
}
