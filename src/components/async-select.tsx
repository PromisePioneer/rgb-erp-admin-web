/**
 * Async Select Component
 * Select dropdown dengan remote search - pakai portal agar tidak kepotong
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, ChevronDown, Check, Loader2, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: number | string
  label: string
}

interface AsyncSelectProps {
  value?: number | string | null
  onChange?: (value: number | string | null) => void
  loadOptions: (search: string) => Promise<SelectOption[]>
  placeholder?: string
  isDisabled?: boolean
  className?: string
  label?: string
  error?: string
  debounceMs?: number
}

export function AsyncSelect({
  value,
  onChange,
  loadOptions,
  placeholder = 'Pilih...',
  isDisabled = false,
  className = '',
  label,
  error,
  debounceMs = 300,
}: AsyncSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const fetchOptions = useCallback(async (searchTerm: string) => {
    setIsLoading(true)
    try {
      const result = await loadOptions(searchTerm)
      setOptions(result)
    } catch {
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }, [loadOptions])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchOptions(search).then(() => {
        // Restore focus after options load
        setTimeout(() => inputRef.current?.focus(), 0)
      })
    }, debounceMs)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, debounceMs, fetchOptions])

  useEffect(() => {
    if (isOpen && options.length === 0) fetchOptions('')
  }, [isOpen])

  useEffect(() => {
    if (value !== null && value !== undefined) {
      const found = options.find(opt => opt.value === value)
      if (found) setSelectedOption(found)
      else {
        loadOptions('').then(opts => {
          const f = opts.find(o => o.value === value)
          if (f) setSelectedOption(f)
        }).catch(() => {})
      }
    } else {
      setSelectedOption(null)
    }
  }, [value, options])

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
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
    if (!isDisabled) {
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
          isOpen && 'ring-2 ring-ring ring-offset-2',
          !selectedOption && 'text-muted-foreground',
          error && 'border-destructive border-2'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && !isDisabled && (
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
            className="fixed z-[9999] bg-background border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
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
                      'flex items-center w-full px-3 py-2.5 text-sm text-left',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                      selectedOption?.value === option.value && 'bg-accent'
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {selectedOption?.value === option.value && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
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
