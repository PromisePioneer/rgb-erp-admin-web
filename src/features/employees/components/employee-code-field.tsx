/**
 * Employee Code Field Component
 * Displays auto-generated employee code with copy to clipboard functionality
 */
import { Copy, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EmployeeCodeFieldProps {
  value: string
  isLoading?: boolean
  error?: string | null
  disabled?: boolean
  className?: string
}

export function EmployeeCodeField({
  value,
  isLoading = false,
  error,
  disabled = false,
  className,
}: EmployeeCodeFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <span>Employee Code</span>
        {isLoading && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400">
            Generating...
          </span>
        )}
        {!isLoading && value && (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-green-600 dark:text-green-400">
            Auto-generated
          </span>
        )}
      </label>

      <div className="relative">
        <Input
          value={value}
          readOnly
          disabled={disabled || isLoading}
          placeholder={isLoading ? 'Generating code...' : 'Select province to generate code'}
          className={cn(
            'pr-20 font-mono text-sm',
            !value && 'text-muted-foreground italic',
            error && 'border-destructive'
          )}
        />

        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              disabled={!value}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {value && (
        <p className="text-xs text-muted-foreground">
          Code format: &#123;province_latin_code&#125;&#95;&#123;romawi_code&#125;&#95;&#123;sequence&#125;
        </p>
      )}
    </div>
  )
}
