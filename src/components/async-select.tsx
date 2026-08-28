/**
 * Async Select Component
 * Select dropdown dengan remote search - pakai portal agar tidak kepotong
 * Race condition safe dengan request-id counter
 */
import {useState, useEffect, useCallback, useRef} from 'react'
import {createPortal} from 'react-dom'
import {Search, X, ChevronDown, Loader2, RotateCw} from 'lucide-react'
import {cn} from '@/lib/utils'

export interface SelectOption {
  value: number | string
  label: string
  description?: string
}

interface AsyncSelectProps {
  value?: number | string | null
  onChange?: (value: number | string | null) => void
  loadOptions: (search: string) => Promise<SelectOption[]>
  placeholder?: string
  isDisabled?: boolean
  readOnly?: boolean
  className?: string
  label?: string
  error?: string
  debounceMs?: number
  defaultOption?: SelectOption | null
}

export function AsyncSelect({
  value,
  onChange,
  loadOptions,
  placeholder = 'Pilih...',
  isDisabled = false,
  readOnly = false,
  className = '',
  label,
  error,
  debounceMs = 300,
  defaultOption,
}: AsyncSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0})

  // Refs for race condition handling
  const requestIdRef = useRef(0) // for fetchOptions (list loading)
  const resolveRequestIdRef = useRef(0) // for resolveSelectedOption (single item resolve)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const hasLoadedInitialRef = useRef(false)

  // Initialize selectedOption from defaultOption prop
  useEffect(() => {
    if (defaultOption) {
      setSelectedOption(defaultOption)
    }
  }, [defaultOption])

  /**
   * Fetch options with request-id to handle race conditions
   * Only updates state if this is still the latest request
   */
  const fetchOptions = useCallback(async (searchTerm: string): Promise<void> => {
    const currentRequestId = ++requestIdRef.current
    setIsLoading(true)

    try {
      const result = await loadOptions(searchTerm)

      // Only apply if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      // Deduplicate options by value to prevent React key warnings
      const seen = new Set()
      const uniqueOptions = result.filter((option) => {
        const key = String(option.value)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setOptions(uniqueOptions)
    } catch {
      // Only clear options if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setOptions([])
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [loadOptions])

  /**
   * Resolve selected option label when value is set but not in options
   * Uses separate request-id to prevent stale updates
   */
  const resolveSelectedOption = useCallback(async (targetValue: number | string | null) => {
    if (targetValue === null || targetValue === undefined) {
      setSelectedOption(null)
      return
    }

    const currentRequestId = ++resolveRequestIdRef.current

    try {
      const result = await loadOptions('')

      // Only apply if this is still the latest resolve request
      if (currentRequestId !== resolveRequestIdRef.current) {
        return
      }

      const found = result.find((opt) => opt.value === targetValue)
      if (found) {
        setSelectedOption(found)
      }
    } catch {
      // Silently fail on resolve errors
    }
  }, [loadOptions])

  // Debounced search effect - only runs after dropdown has been opened at least once
  useEffect(() => {
    // Don't auto-fetch before dropdown has been opened at least once
    if (!isOpen && !hasLoadedInitialRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchOptions(search).then(() => {
        setTimeout(() => inputRef.current?.focus(), 0)
      })
    }, debounceMs)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, debounceMs, fetchOptions, isOpen])

  // Handle readOnly mode: load options when value is set but dropdown never opened
  useEffect(() => {
    if (readOnly && value !== null && value !== undefined && options.length === 0) {
      fetchOptions('')
    }
  }, [readOnly, value, options.length])

  // Load initial options when dropdown opens (only first time)
  useEffect(() => {
    if (isOpen && !hasLoadedInitialRef.current) {
      fetchOptions('')
      hasLoadedInitialRef.current = true
    }
  }, [isOpen])

  // Handle value prop changes
  useEffect(() => {
    if (defaultOption) {
      setSelectedOption(defaultOption)
    } else if (value !== null && value !== undefined) {
      const found = options.find((opt) => opt.value === value)
      if (found) {
        setSelectedOption(found)
      } else {
        // Try to resolve from API (only when not readOnly to avoid extra calls)
        resolveSelectedOption(value)
      }
    } else {
      setSelectedOption(null)
    }
  }, [value, options, defaultOption, resolveSelectedOption])

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()

      const dropdownHeight = 280
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top: number
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Show above if not enough space below
        top = rect.top - dropdownHeight - 4
      } else {
        // Show below (default)
        top = rect.bottom + 4
      }

      setDropdownPosition({
        top,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [isOpen, updatePosition])

  const handleSelect = (option: SelectOption) => {
    if (readOnly) return
    setSelectedOption(option)
    onChange?.(option.value)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange?.(null)
  }

  const handleOpen = () => {
    if (!isDisabled && !readOnly) {
      updatePosition()
      setIsOpen(true)
    } else if (readOnly) {
      updatePosition()
      setIsOpen(true)
    }
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-foreground">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={isDisabled}
        onClick={handleOpen}
        className={cn(
          'flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-md border bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
          readOnly && !isDisabled && 'cursor-pointer',
          isOpen && 'ring-2 ring-ring ring-offset-2',
          !selectedOption && 'text-muted-foreground',
          error && 'border-destructive border-2'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && !isDisabled && !readOnly && (
            <span onClick={handleClear} className="p-0.5 rounded-full hover:bg-muted cursor-pointer">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Dropdown Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="fixed z-[9999] bg-background border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-100 max-w-[calc(100vw-16px)]"
            style={{
              top: Math.max(8, Math.min(dropdownPosition.top, window.innerHeight - 280 - 8)),
              left: Math.max(8, Math.min(dropdownPosition.left, window.innerWidth - dropdownPosition.width - 8)),
              width: dropdownPosition.width,
              maxHeight: '280px',
            }}
          >
            {/* Search Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/30">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik untuk mencari..."
                disabled={isLoading}
                className="flex-1 h-6 text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
              )}
              {search && !isLoading && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-0.5 rounded hover:bg-muted"
                >
                  <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-[240px] overflow-y-auto py-1">
              {readOnly && (
                <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-b">
                  Mode baca saja - tidak dapat mengubah
                </div>
              )}
              {isLoading && options.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Memuat...
                </div>
              ) : options.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {search ? 'Tidak ada hasil' : 'Tidak ada data'}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'flex flex-col items-start w-full px-3 py-2.5 text-sm text-left',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                      selectedOption?.value === option.value && 'bg-accent'
                    )}
                  >
                    <span className="font-medium truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {option.description}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {error && (
        <p className="text-sm text-destructive mt-1.5">{error}</p>
      )}
    </div>
  )
}

export default AsyncSelect
