"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={props.checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full w-11 h-6 bg-gray-200 peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:rounded-full after:bg-white after:shadow-sm after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
