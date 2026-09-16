/**
 * MOU Validation Schema using Zod
 * Real-time validation for frontend
 */
import { z } from 'zod'

// Custom refinements
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

// Shift validation schema
export const mouShiftSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama shift harus diisi')
    .max(100, 'Nama shift maksimal 100 karakter'),
  start_time: z
    .string()
    .min(1, 'Jam masuk harus diisi')
    .regex(timeRegex, 'Format jam tidak valid (HH:MM)'),
  end_time: z
    .string()
    .min(1, 'Jam pulang harus diisi')
    .regex(timeRegex, 'Format jam tidak valid (HH:MM)'),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.end_time > data.start_time
    }
    return true
  },
  {
    message: 'Jam pulang harus setelah jam masuk',
    path: ['end_time'],
  }
)

// Personnel validation schema
export const mouPersonnelSchema = z.object({
  role_id: z
    .number()
    .min(1, 'Role harus dipilih'),
  role_name: z
    .string()
    .min(1, 'Nama role harus ada'),
  quantity: z
    .number()
    .min(1, 'Jumlah minimal 1 orang')
    .max(1000, 'Jumlah maksimal 1000 orang'),
})

// Helper to check valid date format
const isValidDateFormat = (val: string): boolean => {
  if (!val || val === '') return true // Allow empty
  return /^\d{4}-\d{2}-\d{2}$/.test(val)
}

// Step 1: MOU Header validation (ALL fields are required)
export const mouStep1Schema = z.object({
  client_id: z
    .number()
    .min(1, 'Client harus dipilih'),
  first_party_name: z
    .string()
    .min(1, 'Nama pihak pertama harus diisi')
    .max(255, 'Nama pihak pertama maksimal 255 karakter'),
  first_party_position: z
    .string()
    .min(1, 'Jabatan pihak pertama harus diisi')
    .max(100, 'Jabatan maksimal 100 karakter'),
  first_party_company_address: z
    .string()
    .min(1, 'Alamat pihak pertama harus diisi')
    .max(500, 'Alamat maksimal 500 karakter'),
  second_party_name: z
    .string()
    .min(1, 'Nama pihak kedua harus diisi')
    .max(255, 'Nama pihak kedua maksimal 255 karakter'),
  second_party_position: z
    .string()
    .min(1, 'Jabatan pihak kedua harus diisi')
    .max(100, 'Jabatan maksimal 100 karakter'),
  second_party_company_address: z
    .string()
    .min(1, 'Alamat pihak kedua harus diisi')
    .max(500, 'Alamat maksimal 500 karakter'),
  date: z
    .string()
    .min(1, 'Tanggal MOU harus diisi')
    .refine((val) => isValidDateFormat(val), 'Format tanggal tidak valid (YYYY-MM-DD)'),
  start_date: z
    .string()
    .min(1, 'Tanggal mulai harus diisi')
    .refine((val) => isValidDateFormat(val), 'Format tanggal tidak valid (YYYY-MM-DD)'),
  end_date: z
    .string()
    .min(1, 'Tanggal selesai harus diisi')
    .refine((val) => isValidDateFormat(val), 'Format tanggal tidak valid (YYYY-MM-DD)'),
  monthly_fee: z
    .string()
    .min(1, 'Fee bulanan harus diisi')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Fee harus berupa angka positif'),
  management_fee: z
    .union([z.string(), z.number()])
    .refine((val) => {
      if (val === '' || val === null || val === undefined) return true
      const num = typeof val === 'string' ? parseFloat(val) : val
      return !isNaN(num) && num >= 0 && num <= 100
    }, 'Management fee harus 0-100%')
    .optional()
    .nullable()
    .or(z.literal('')),
  pph23: z
    .union([z.string(), z.number()])
    .refine((val) => {
      if (val === '' || val === null || val === undefined) return true
      const num = typeof val === 'string' ? parseFloat(val) : val
      return !isNaN(num) && num >= 0 && num <= 100
    }, 'PPH 23 harus 0-100%')
    .optional()
    .nullable()
    .or(z.literal('')),
  ppn: z
    .union([z.string(), z.number()])
    .refine((val) => {
      if (val === '' || val === null || val === undefined) return true
      const num = typeof val === 'string' ? parseFloat(val) : val
      return !isNaN(num) && num >= 0 && num <= 100
    }, 'PPN harus 0-100%')
    .optional()
    .nullable()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.start_date && data.end_date && data.start_date !== '' && data.end_date !== '') {
      return data.end_date >= data.start_date
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['end_date'],
  }
)

// Step 2: Shifts validation (at least one shift required)
export const mouStep2Schema = z.object({
  shifts: z.array(mouShiftSchema).min(1, 'Minimal harus ada 1 shift'),
})

// Step 3: Personnel validation (at least one personnel required)
export const mouStep3Schema = z.object({
  personnel: z.array(mouPersonnelSchema).min(1, 'Minimal harus ada 1 personnel'),
})

// Full form validation
export const mouFormSchema = z.object({
  // Step 1
  client_id: z.number().min(1, 'Client harus dipilih'),
  first_party_name: z.string().min(1, 'Nama pihak pertama harus diisi').max(255),
  first_party_position: z.string().max(100).optional().or(z.literal('')),
  first_party_company_address: z.string().max(500).optional().or(z.literal('')),
  second_party_name: z.string().min(1, 'Nama pihak kedua harus diisi').max(255),
  second_party_position: z.string().max(100).optional().or(z.literal('')),
  second_party_company_address: z.string().max(500).optional().or(z.literal('')),
  date: z.string().min(1, 'Tanggal MOU harus diisi'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  monthly_fee: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  management_fee: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  pph23: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  ppn: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  // Step 2
  shifts: z.array(mouShiftSchema).min(1, 'Minimal harus ada 1 shift'),
  // Step 3
  personnel: z.array(mouPersonnelSchema).min(1, 'Minimal harus ada 1 personnel'),
  // Step 4 (placeholder)
  employees: z.array(z.object({})).optional(),
})

// Type inference
export type MouStep1FormData = z.infer<typeof mouStep1Schema>
export type MouStep2FormData = z.infer<typeof mouStep2Schema>
export type MouStep3FormData = z.infer<typeof mouStep3Schema>
export type MouFormData = z.infer<typeof mouFormSchema>

// Validation helper functions
export const validateStep1 = (data: unknown) => {
  return mouStep1Schema.safeParse(data)
}

export const validateStep2 = (data: unknown) => {
  return mouStep2Schema.safeParse(data)
}

export const validateStep3 = (data: unknown) => {
  return mouStep3Schema.safeParse(data)
}

export const validateShift = (data: unknown) => {
  return mouShiftSchema.safeParse(data)
}

export const validatePersonnel = (data: unknown) => {
  return mouPersonnelSchema.safeParse(data)
}

// Parse number or string to number safely
export const parseNumber = (value: string | number | null | undefined): number | null => {
  if (value === '' || value === null || value === undefined) return null
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? null : num
}
