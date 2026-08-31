/**
 * Schedules Grid Cell Component
 * Individual cell in the weekly grid showing shift or empty state
 */
import { useState } from 'react'
import { Pencil, Calendar } from 'lucide-react'
import { getShiftColor, isDayOff, formatShiftTime } from '../utils/shift-colors'
import type { CalendarSchedule } from '../types/schedules.types'

interface SchedulesGridCellProps {
  date: string
  employeeId: number
  employeeName: string
  schedule: CalendarSchedule | null | undefined
  onCellClick: (employeeId: number, date: string, scheduleId: number | null) => void
}

export function SchedulesGridCell({
  date,
  employeeId,
  employeeName,
  schedule,
  onCellClick,
}: SchedulesGridCellProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onCellClick(employeeId, date, schedule?.id ?? null)
  }

  // Has schedule - show colored cell
  if (schedule) {
    const { bg, text } = getShiftColor(schedule.shift_name)
    const isOff = isDayOff(schedule.shift_name)
    const timeText = formatShiftTime(schedule.shift_start, schedule.shift_end)

    return (
      <div
        className={`flex-1 min-w-[100px] min-h-[60px] border-r border-b ${bg} ${text} p-1.5 cursor-pointer transition-opacity hover:opacity-90`}
        onClick={handleClick}
        title={`${employeeName} - ${schedule.shift_name || 'Jadwal'}`}
      >
        <div className="flex flex-col h-full justify-center">
          <div className={`text-xs font-medium ${isOff ? 'text-white/80' : ''}`}>
            {timeText}
          </div>
          <div className={`text-sm font-semibold truncate ${isOff ? 'text-white/90' : ''}`}>
            {schedule.shift_name || 'Jadwal'}
          </div>
          {schedule.pos_name && (
            <div className={`text-[10px] truncate ${isOff ? 'text-white/70' : 'text-white/80'}`}>
              {schedule.pos_name}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Empty cell - show dashed border with hover effect
  return (
    <div
      className={`flex-1 min-w-[100px] min-h-[60px] border-r border-b relative transition-colors ${
        isHovered ? 'bg-gray-100' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Dashed border overlay */}
      <div className={`absolute inset-0.5 border-2 border-dashed ${
        isHovered ? 'border-primary/50' : 'border-gray-300'
      } rounded pointer-events-none`} />

      {/* Add icon on hover */}
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-md">
            <Pencil className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      )}

      {/* Click hint on hover */}
      {isHovered && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-[10px] text-gray-400 whitespace-nowrap">Klik untuk tambah</span>
        </div>
      )}
    </div>
  )
}

// Employee row header component
interface EmployeeRowHeaderProps {
  employeeName: string
  employeeCode: string
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function EmployeeRowHeader({
  employeeName,
  employeeCode,
  isSelected,
  onSelect,
}: EmployeeRowHeaderProps) {
  // Generate avatar initials
  const initials = employeeName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="sticky left-0 z-10 bg-white border-r border-b min-w-[200px] px-4 py-2 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
        {initials}
      </div>

      {/* Name and code */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate">
          {employeeName}
        </span>
        <span className="text-xs text-gray-500">
          #{employeeCode}
        </span>
      </div>
    </div>
  )
}

// Loading skeleton for grid
export function GridLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header row */}
      <div className="flex bg-gray-100">
        <div className="min-w-[200px] h-14 bg-gray-200" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 h-14 bg-gray-200 border-l" />
        ))}
      </div>

      {/* Data rows */}
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          <div className="min-w-[200px] h-16 bg-gray-100 border-r border-t px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="space-y-1">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-2 w-12 bg-gray-200 rounded" />
            </div>
          </div>
          {[...Array(7)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 h-16 bg-gray-50 border-l border-t"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
