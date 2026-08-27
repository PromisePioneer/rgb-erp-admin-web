"use client"
import {useState, useEffect} from 'react'
import {Input} from '@/components/ui/input'

interface CurrencyInputProps {
    value: number
    onChange: (value: number) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    disabled = false,
    className = ''
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Format number to currency display (Indonesian: 1.000.000)
    const formatToCurrency = (num: number): string => {
        if (num === 0 || num === null || num === undefined) return ''
        return new Intl.NumberFormat('id-ID').format(num)
    }

    // Update display when value changes from outside
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formatToCurrency(value))
        }
    }, [value, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value

        // Allow digits and dots
        const digitsOnly = rawValue.replace(/[^\d]/g, '')
        const numValue = digitsOnly ? parseInt(digitsOnly, 10) : 0

        // Show formatted while typing
        if (numValue > 0) {
            // Show formatted with dots for easier reading
            setDisplayValue(formatToCurrency(numValue))
        } else {
            setDisplayValue('')
        }

        onChange(numValue)
    }

    const handleBlur = () => {
        setIsFocused(false)
        setDisplayValue(formatToCurrency(value))
    }

    const handleFocus = () => {
        setIsFocused(true)
        // Show raw number for easy editing
        if (value > 0) {
            setDisplayValue(value.toString())
        }
    }

    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                Rp
            </div>
            <Input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className={`pl-10 text-right font-mono ${className}`}
            />
        </div>
    )
}
