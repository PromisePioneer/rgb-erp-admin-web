/**
 * useEmployeeCode Hook
 * Handles automatic employee code generation based on province, company, and join year
 *
 * Format: {COMPANY}-86.{PROVINCE_CODE}.{YEAR}.{SEQUENCE}
 * - RGB company: uses latin_code (BPS code, e.g., "32" for Jawa Barat)
 * - RBM company: uses romawi_code (e.g., "XII" for Jawa Barat)
 * - YEAR: 2-digit year from join_date (e.g., "23" for 2023)
 */
import { useState, useCallback } from 'react'
import { employeesApi } from '../api/employees-api'

interface UseEmployeeCodeOptions {
  onCodeGenerated?: (code: string) => void
}

interface UseEmployeeCodeReturn {
  code: string
  isLoading: boolean
  error: string | null
  generateCode: (provinceId: number, companyId?: number, joinYear?: number) => Promise<string | null>
  clearCode: () => void
}

export function useEmployeeCode(options: UseEmployeeCodeOptions = {}): UseEmployeeCodeReturn {
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = useCallback(async (provinceId: number, companyId?: number, joinYear?: number): Promise<string | null> => {
    if (!provinceId) {
      setCode('')
      setError(null)
      options.onCodeGenerated?.('')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await employeesApi.generateCode(provinceId, companyId, joinYear)
      const generatedCode = response.data.next_code
      setCode(generatedCode)
      options.onCodeGenerated?.(generatedCode)
      return generatedCode
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate employee code'
      setError(message)
      setCode('')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options.onCodeGenerated])

  const clearCode = useCallback(() => {
    setCode('')
    setError(null)
    options.onCodeGenerated?.('')
  }, [options.onCodeGenerated])

  return {
    code,
    isLoading,
    error,
    generateCode,
    clearCode,
  }
}
