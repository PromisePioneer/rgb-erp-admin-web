"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string | null
  onChange?: (date: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  format?: string
  selectionMode?: "date" | "month"
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
  format: formatStr = "yyyy-MM-dd",
  selectionMode = "date",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value && isValid(parseISO(value)) ? parseISO(value) : undefined
  )

  React.useEffect(() => {
    if (value && isValid(parseISO(value))) {
      setSelectedDate(parseISO(value))
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onChange?.(format(date, formatStr))
    } else {
      onChange?.(undefined)
    }
  }

  const displayValue = selectedDate
    ? selectionMode === "month"
      ? format(selectedDate, "MMMM yyyy")
      : format(selectedDate, "dd MMM yyyy")
    : placeholder

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between font-normal h-10 px-3 py-2 text-sm rounded-md border bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          !selectedDate && "text-muted-foreground",
          className
        )}
      >
        <span className="flex items-center truncate">
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{displayValue}</span>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={selectionMode === "date" ? (date) => date > new Date() : undefined}
          captionLayout={selectionMode === "month" ? "dropdown-months" : "label"}
          startMonth={selectionMode === "month" ? new Date("2000-01-01") : undefined}
          endMonth={selectionMode === "month" ? new Date("2050-12-31") : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
