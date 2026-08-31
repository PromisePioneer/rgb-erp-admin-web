/**
 * Shift Color Utility
 * Maps shift names to Tailwind color classes for visual distinction
 */

// Color palette for shifts - matches reference UI
const SHIFT_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  // Common shifts
  regular: { bg: 'bg-green-500', text: 'text-white' },
  normal: { bg: 'bg-green-500', text: 'text-white' },
  shift: { bg: 'bg-green-500', text: 'text-white' },

  // Overtime
  ot1: { bg: 'bg-blue-500', text: 'text-white' },
  overtime: { bg: 'bg-blue-500', text: 'text-white' },
  lembur: { bg: 'bg-blue-500', text: 'text-white' },

  // Day names (Indonesian)
  senin: { bg: 'bg-pink-300', text: 'text-gray-800' },
  selasa: { bg: 'bg-purple-500', text: 'text-white' },
  rabu: { bg: 'bg-pink-500', text: 'text-white' },
  kamis: { bg: 'bg-red-500', text: 'text-white' },
  jumat: { bg: 'bg-teal-500', text: 'text-white' },
  sabtu: { bg: 'bg-orange-500', text: 'text-white' },
  minggu: { bg: 'bg-yellow-500', text: 'text-gray-800' },

  // Day off / off
  dayoff: { bg: 'bg-gray-400', text: 'text-white' },
  off: { bg: 'bg-gray-400', text: 'text-white' },
  liburnya: { bg: 'bg-gray-400', text: 'text-white' },
  istirahat: { bg: 'bg-gray-400', text: 'text-white' },
  cuti: { bg: 'bg-amber-400', text: 'text-gray-800' },
  sick: { bg: 'bg-orange-400', text: 'text-white' },
  izin: { bg: 'bg-cyan-400', text: 'text-gray-800' },

  // Special shifts (with or without numbers)
  night: { bg: 'bg-indigo-600', text: 'text-white' },
  morning: { bg: 'bg-green-500', text: 'text-white' },
  middle: { bg: 'bg-amber-500', text: 'text-gray-800' },
  pagi: { bg: 'bg-emerald-500', text: 'text-white' },
  siang: { bg: 'bg-amber-500', text: 'text-gray-800' },
  malam: { bg: 'bg-slate-600', text: 'text-white' },
}

// Fallback color palette for unknown shifts
const FALLBACK_PALETTE = [
  { bg: 'bg-rose-400', text: 'text-white' },
  { bg: 'bg-cyan-400', text: 'text-gray-800' },
  { bg: 'bg-lime-500', text: 'text-white' },
  { bg: 'bg-fuchsia-500', text: 'text-white' },
  { bg: 'bg-sky-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-pink-400', text: 'text-white' },
]

/**
 * Get color classes for a shift
 * @param shiftName - Name of the shift
 * @returns Object with bg and text Tailwind classes
 */
export function getShiftColor(shiftName: string | null | undefined): {
  bg: string
  text: string
} {
  if (!shiftName) {
    return { bg: 'bg-transparent', text: 'text-gray-400' }
  }

  const normalizedName = shiftName.toLowerCase().trim()

  // Check exact match first
  if (SHIFT_COLORS[normalizedName]) {
    return SHIFT_COLORS[normalizedName]
  }

  // Check partial matches
  for (const [key, colors] of Object.entries(SHIFT_COLORS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return colors
    }
  }

  // Fallback: hash the name to get consistent color
  const hash = shiftName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const index = Math.abs(hash) % FALLBACK_PALETTE.length
  return FALLBACK_PALETTE[index]
}

/**
 * Check if a shift is a day-off type
 */
export function isDayOff(shiftName: string | null | undefined): boolean {
  if (!shiftName) return false
  const normalized = shiftName.toLowerCase().trim()
  return ['dayoff', 'off', 'liburnya', 'istirahat', 'cuti', 'sick', 'izin'].some(
    (d) => normalized === d || normalized.includes(d)
  )
}

/**
 * Get display text for shift times
 */
export function formatShiftTime(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) return '00:00 - 00:00'
  const s = start ?? '00:00'
  const e = end ?? '00:00'
  return `${s.slice(0, 5)} - ${e.slice(0, 5)}`
}
