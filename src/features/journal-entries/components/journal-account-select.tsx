"use client"
import {useState, useEffect, useCallback, useRef} from 'react'
import {createPortal} from 'react-dom'
import {Search, X, ChevronDown, ChevronRight, Check, Loader2} from 'lucide-react'
import {cn} from '@/lib/utils'
import * as React from "react";

export interface SelectOption {
    value: number | string
    label: string
    is_header?: boolean
    parent_id?: number | null
}

interface JournalAccountSelectProps {
    value: number | string | null
    onChange: (value: number | string | null) => void
    loadOptions: (search: string) => Promise<SelectOption[]>
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function JournalAccountSelect({
                                         value,
                                         onChange,
                                         loadOptions,
                                         placeholder = 'Pilih...',
                                         disabled = false,
                                         className = "",
                                     }: JournalAccountSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<SelectOption[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0})
    const [expandedHeaders, setExpandedHeaders] = useState<Set<number | string>>(new Set())


    const triggerRef = useRef<HTMLButtonElement>(null)

    // Fetch options
    const fetchOptions = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await loadOptions(search)
            setOptions(result)
        } catch {
            setOptions([])
        } finally {
            setIsLoading(false)
        }
    }, [loadOptions, search])

    // Initial load
    useEffect(() => {
        if (isOpen) {
            fetchOptions()
        }
    }, [isOpen, fetchOptions])

    // Resolve selected option
    useEffect(() => {
        if (isOpen && value && options.length > 0) {
            const found = options.find(opt => opt.value === value)
            if (found) {
                setSelectedOption(found)
            }
        } else if (!value) {
            setSelectedOption(null)
        }
    }, [value, options, isOpen])

    // Toggle header expansion
    const toggleHeader = (headerValue: number | string) => {
        setExpandedHeaders(prev => {
            const next = new Set(prev)
            if (next.has(headerValue)) {
                next.delete(headerValue)
            } else {
                next.add(headerValue)
            }
            return next
        })
    }

    // Build tree structure
    const treeOptions = useCallback(() => {
        const headers = options.filter(opt => opt.is_header && !opt.parent_id)
        const children = options.filter(opt => !opt.is_header || opt.parent_id)

        return headers.map(header => ({
            ...header,
            children: children.filter(child =>
                child.parent_id === header.value ||
                (header.parent_id && child.parent_id === header.parent_id)
            )
        }))
    }, [options])

    const handleSelect = (option: SelectOption) => {
        if (option.is_header) return // Can't select header
        setSelectedOption(option)
        onChange(option.value)
        setIsOpen(false)
        setSearch('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedOption(null)
        onChange(null)
    }

    const handleOpen = () => {
        if (!disabled && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()

            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
            })

            setIsOpen(true)
        }
    }

    const tree = treeOptions()

    return (
        <div className={cn('relative', className)}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={handleOpen}
                className={cn(
                    'flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-md border bg-background',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
                    !selectedOption && 'text-muted-foreground',
                    isOpen && 'ring-2 ring-ring ring-offset-2'
                )}
            >
        <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption?.label || placeholder}
        </span>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedOption && !disabled && (
                        <span onClick={handleClear} className="p-0.5 rounded-full hover:bg-muted cursor-pointer">
              <X className="h-3.5 w-3.5 text-muted-foreground"/>
            </span>
                    )}
                    <ChevronDown className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}/>
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
                            left: Math.max(8, Math.min(dropdownPosition.left, window.innerWidth - dropdownPosition.width - 8)),
                            width: dropdownPosition.width,
                            maxHeight: '320px',
                        }}
                    >
                        {/* Search Header */}
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/30">
                            <Search className="h-4 w-4 text-muted-foreground shrink-0"/>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik untuk mencari..."
                                disabled={isLoading}
                                className="flex-1 h-6 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            />
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0"/>}
                        </div>

                        {/* Options List */}
                        <div className="max-h-[260px] overflow-y-auto py-1">
                            {isLoading && options.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                                    Memuat...
                                </div>
                            ) : options.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    {search ? 'Tidak ada hasil' : 'Tidak ada data'}
                                </div>
                            ) : (
                                tree.length > 0 ? tree.map((header) => (
                                    <div key={String(header.value)}>
                                        {/* Header Row */}
                                        <button
                                            type="button"
                                            onClick={() => toggleHeader(header.value)}
                                            className={cn(
                                                'flex items-center w-full px-3 py-2 text-sm text-left font-medium bg-muted/30 hover:bg-muted cursor-pointer'
                                            )}
                                        >
                                            {expandedHeaders.has(header.value) ? (
                                                <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground"/>
                                            ) : (
                                                <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground"/>
                                            )}
                                            <span className="flex-1">{header.label}</span>
                                        </button>

                                        {/* Child Rows */}
                                        {expandedHeaders.has(header.value) && header.children.map((child) => (
                                            <button
                                                key={String(child.value)}
                                                type="button"
                                                onClick={() => handleSelect(child)}
                                                disabled={child.is_header}
                                                className={cn(
                                                    'flex items-center w-full px-3 py-2.5 text-sm text-left',
                                                    'hover:bg-accent hover:text-accent-foreground',
                                                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                                                    selectedOption?.value === child.value && 'bg-accent',
                                                    child.is_header && 'opacity-50 cursor-not-allowed'
                                                )}
                                            >
                                                <span className="w-8"/>
                                                <span className="flex-1">{child.label}</span>
                                                {selectedOption?.value === child.value && (
                                                    <Check className="h-4 w-4 text-primary shrink-0 ml-2"/>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )) : (
                                    // No tree structure - just flat list of child accounts
                                    options.filter(opt => !opt.is_header).map((option) => (
                                        <button
                                            key={String(option.value)}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={cn(
                                                'flex items-center w-full px-3 py-2.5 text-sm text-left',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                                                selectedOption?.value === option.value && 'bg-accent'
                                            )}
                                        >
                                            <span className="flex-1">{option.label}</span>
                                            {selectedOption?.value === option.value && (
                                                <Check className="h-4 w-4 text-primary shrink-0 ml-2"/>
                                            )}
                                        </button>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    )
}
