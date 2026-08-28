/**
 * Tangible Asset Class Types
 */
export interface TangibleAssetClass {
  id: number
  name: string
  useful_life: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TangibleAssetClassFormData {
  name: string
  useful_life: number
  notes?: string
}
