/**
 * useEmployeeCode Hook
 * Handles automatic employee code generation based on province selection
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
  generateCode: (provinceId: number) => Promise<string | null>
  clearCode: () => void
}

export function useEmployeeCode(options: UseEmployeeCodeOptions = {}): UseEmployeeCodeReturn {
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = useCallback(async (provinceId: number): Promise<string | null> => {
    if (!provinceId) {
      setCode('')
      setError(null)
      options.onCodeGenerated?.('')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await employeesApi.getNextCode(provinceId)
      const generatedCode = response.data.code
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
