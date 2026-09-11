/**
 * Centralized Condition Types
 * Standardized condition values for inventory items
 *
 * Non-chemical (tool/ppe/machine): sangat_baik | baik | cukup_baik | kurang_baik | rusak
 * Chemical: full | half | quarter | habis
 */

// Non-chemical conditions (quality-based for tools, ppes, machines)
export const NON_CHEMICAL_CONDITIONS = [
  'sangat_baik',
  'baik',
  'cukup_baik',
  'kurang_baik',
  'rusak',
] as const

export type NonChemicalCondition = typeof NON_CHEMICAL_CONDITIONS[number]

// Chemical conditions (stock-based)
export const CHEMICAL_CONDITIONS = [
  'full',
  'half',
  'quarter',
  'habis',
] as const

export type ChemicalCondition = typeof CHEMICAL_CONDITIONS[number]

// All valid condition values
export const ALL_CONDITIONS = [...NON_CHEMICAL_CONDITIONS, ...CHEMICAL_CONDITIONS] as const

export type Condition = NonChemicalCondition | ChemicalCondition

// Legacy condition values (for data normalization)
export const LEGACY_CONDITION_MAPPING: Record<string, Condition> = {
  // Non-chemical legacy → new
  excellent: 'sangat_baik',
  good: 'baik',
  fair: 'cukup_baik',
  poor: 'kurang_baik',
  replace: 'rusak',
  damaged: 'rusak',
  // Chemical legacy → new
  low: 'quarter',
  below_low: 'habis',
  belowlow: 'habis',
  empty: 'habis',
}

// Condition labels (Indonesian)
export const CONDITION_LABELS: Record<Condition, string> = {
  sangat_baik: 'Sangat Baik',
  baik: 'Baik',
  cukup_baik: 'Cukup Baik',
  kurang_baik: 'Kurang Baik',
  rusak: 'Rusak',
  full: 'Penuh',
  half: 'Setengah',
  quarter: 'Seperempat',
  habis: 'Habis',
}

// Condition colors (Tailwind classes)
export const CONDITION_COLORS: Record<Condition, string> = {
  sangat_baik: 'bg-green-100 text-green-800',
  baik: 'bg-emerald-100 text-emerald-800',
  cukup_baik: 'bg-yellow-100 text-yellow-800',
  kurang_baik: 'bg-orange-100 text-orange-800',
  rusak: 'bg-red-100 text-red-800',
  full: 'bg-green-100 text-green-800',
  half: 'bg-yellow-100 text-yellow-800',
  quarter: 'bg-orange-100 text-orange-800',
  habis: 'bg-red-100 text-red-800',
}

// Condition ranks (higher = better, for comparison)
export const CONDITION_RANKS: Record<Condition, number> = {
  // Non-chemical: sangat_baik > baik > cukup_baik > kurang_baik > rusak
  sangat_baik: 5,
  baik: 4,
  cukup_baik: 3,
  kurang_baik: 2,
  rusak: 1,
  // Chemical: full > half > quarter > habis
  full: 4,
  half: 3,
  quarter: 2,
  habis: 1,
}

// Helper functions

/**
 * Get label for a condition value
 */
export function getConditionLabel(condition: Condition | string | null | undefined): string {
  if (!condition) return '-'
  if (condition in CONDITION_LABELS) {
    return CONDITION_LABELS[condition as Condition]
  }
  return condition
}

/**
 * Get color class for a condition value
 */
export function getConditionColor(condition: Condition | string | null | undefined): string {
  if (!condition) return 'bg-gray-100 text-gray-800'
  if (condition in CONDITION_COLORS) {
    return CONDITION_COLORS[condition as Condition]
  }
  return 'bg-gray-100 text-gray-800'
}

/**
 * Normalize legacy condition values to standardized values
 */
export function normalizeCondition(condition: string | null | undefined): Condition | null {
  if (!condition) return null
  if (condition in LEGACY_CONDITION_MAPPING) {
    return LEGACY_CONDITION_MAPPING[condition]
  }
  if (ALL_CONDITIONS.includes(condition as Condition)) {
    return condition as Condition
  }
  return null
}

/**
 * Check if a condition is valid
 */
export function isValidCondition(condition: string | null | undefined): condition is Condition {
  if (!condition) return false
  return ALL_CONDITIONS.includes(condition as Condition)
}

/**
 * Check if a condition is chemical type
 */
export function isChemicalCondition(condition: string | null | undefined): boolean {
  if (!condition) return false
  return CHEMICAL_CONDITIONS.includes(condition as ChemicalCondition)
}

/**
 * Check if a condition is non-chemical type
 */
export function isNonChemicalCondition(condition: string | null | undefined): boolean {
  if (!condition) return false
  return NON_CHEMICAL_CONDITIONS.includes(condition as NonChemicalCondition)
}

/**
 * Calculate condition from stock percentage and category
 * Chemical: Full (>=75%), Half (>=50%), Quarter (>=25%), Habis (<25%)
 * Non-chemical: Sangat Baik (>=85%), Baik (>=65%), Cukup Baik (>=45%), Kurang Baik (>=25%), Rusak (<25%)
 */
export function calculateCondition(
  categoryName: string | null | undefined,
  currentStock: number,
  initialStock: number
): Condition {
  const cat = (categoryName || '').toLowerCase()
  const isChemical = cat.includes('chemical') || cat.includes('kimia')

  const percentage = initialStock > 0 ? (currentStock / initialStock) * 100 : 0

  if (isChemical) {
    if (percentage >= 75) return 'full'
    if (percentage >= 50) return 'half'
    if (percentage >= 25) return 'quarter'
    return 'habis'
  }

  // Non-chemical thresholds
  if (percentage >= 85) return 'sangat_baik'
  if (percentage >= 65) return 'baik'
  if (percentage >= 45) return 'cukup_baik'
  if (percentage >= 25) return 'kurang_baik'
  return 'rusak'
}
