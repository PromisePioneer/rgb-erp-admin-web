"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, disabled, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full w-9 h-5 bg-input peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            checked ? "bg-primary" : "bg-input",
            className
          )}
          style={{
            transition: 'background-color 200ms ease-in-out',
          }}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 bg-white rounded-full shadow-sm",
              disabled && "pointer-events-none opacity-50"
            )}
            style={{
              left: checked ? '20px' : '2px',
              transition: 'left 200ms ease-in-out',
            }}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
