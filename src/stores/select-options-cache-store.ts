/**
 * Select Options Cache Store
 * Caches select options data to avoid redundant API calls
 * across multiple AsyncSelect instances
 */
import {create} from 'zustand'
import type {SelectOption} from '@/components/async-select'

interface CacheEntry {
  data: SelectOption[]
  fetchedAt: number
}

interface SelectOptionsCacheState {
  cache: Record<string, CacheEntry>
  getCache: (key: string, maxAgeMs?: number) => SelectOption[] | null
  setCache: (key: string, data: SelectOption[]) => void
  invalidate: (key?: string) => void
}

// Cache TTL: 5 minutes default
const DEFAULT_CACHE_TTL = 5 * 60 * 1000

export const useSelectOptionsCacheStore = create<SelectOptionsCacheState>((set, get) => ({
  cache: {},

  /**
   * Get cached data if exists and is fresh
   * @param key Cache key (e.g., 'employees', 'shifts', 'areas:5')
   * @param maxAgeMs Maximum age in ms (default: 5 minutes)
   * @returns Cached data or null if not found/expired
   */
  getCache: (key: string, maxAgeMs: number = DEFAULT_CACHE_TTL) => {
    const entry = get().cache[key]
    if (!entry) return null

    const now = Date.now()
    if (now - entry.fetchedAt > maxAgeMs) {
      // Cache expired
      return null
    }

    return entry.data
  },

  /**
   * Store data in cache
   * @param key Cache key
   * @param data Options data to cache
   */
  setCache: (key: string, data: SelectOption[]) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          fetchedAt: Date.now(),
        },
      },
    }))
  },

  /**
   * Invalidate cache
   * @param key Optional key to invalidate. If omitted, clears entire cache.
   */
  invalidate: (key?: string) => {
    if (key) {
      set((state) => {
        const newCache = {...state.cache}
        delete newCache[key]
        return {cache: newCache}
      })
    } else {
      set({cache: {}})
    }
  },
}))

// Export type for convenience
export type {CacheEntry, SelectOptionsCacheState}
