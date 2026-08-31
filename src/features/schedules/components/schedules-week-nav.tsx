/**
 * Schedules Week Navigation Component
 * Navigation for week view with prev/next arrows and date range label
 */
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSchedulesStore } from '../store/schedules-store'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.getDate()
}

function formatMonthYear(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function isToday(dateStr: string) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

export function SchedulesWeekNav() {
  const { currentDate, prevWeek, nextWeek, getWeekDates } = useSchedulesStore()

  const weekDates = getWeekDates()
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]

  const formatWeekLabel = () => {
    if (!firstDate || !lastDate) return 'Pilih Minggu'

    const first = new Date(firstDate + 'T00:00:00')
    const last = new Date(lastDate + 'T00:00:00')

    // Same month
    if (first.getMonth() === last.getMonth()) {
      return `${DAYS[first.getDay()]} ${formatDate(firstDate)} - ${DAYS[last.getDay()]} ${formatDate(lastDate)} ${formatMonthYear(firstDate)}`
    }

    // Different months
    return `${DAYS[first.getDay()]} ${formatDate(firstDate)} ${formatMonthYear(firstDate)} - ${DAYS[last.getDay()]} ${formatDate(lastDate)} ${formatMonthYear(lastDate)}`
  }

  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevWeek}
          className="h-8 w-8"
          aria-label="Minggu sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Calendar className="h-5 w-5 text-primary" />

        <span className="font-semibold text-lg min-w-[200px]">
          {formatWeekLabel()}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={nextWeek}
          className="h-8 w-8"
          aria-label="Minggu berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Header row component for the week grid
export function WeekHeaderRow() {
  const { getWeekDates } = useSchedulesStore()
  const weekDates = getWeekDates()

  return (
    <>
      {/* Name column header */}
      <div className="sticky left-0 z-20 bg-gray-100 border-r border-b px-4 py-3 font-medium text-sm text-gray-700 min-w-[200px]">
        Nama
      </div>

      {/* Day column headers */}
      {weekDates.map((date) => {
        const d = new Date(date + 'T00:00:00')
        const dayName = DAYS[d.getDay()]
        const dayNum = d.getDate()
        const today = isToday(date)

        return (
          <div
            key={date}
            className={`flex-1 min-w-[100px] border-r border-b px-2 py-3 text-center ${
              today ? 'bg-primary/10' : 'bg-gray-100'
            }`}
          >
            <div className={`text-xs font-medium ${today ? 'text-primary' : 'text-gray-500'}`}>
              {dayName}
            </div>
            <div className={`text-sm font-semibold ${today ? 'text-primary' : 'text-gray-800'}`}>
              {dayNum}
            </div>
          </div>
        )
      })}
    </>
  )
}
