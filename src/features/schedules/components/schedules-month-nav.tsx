/**
 * Schedules Month Navigation Component
 * Navigation for month view with prev/next arrows and month label
 */
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSchedulesStore } from '../store/schedules-store'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function SchedulesMonthNav() {
  const { prevMonth, nextMonth, goToMonth, currentMonth } = useSchedulesStore()

  const formatMonthLabel = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    return `${MONTHS[month - 1]} ${year}`
  }

  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Calendar className="h-5 w-5 text-primary" />

        <span className="font-semibold text-lg min-w-[180px]">
          {formatMonthLabel()}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month picker */}
      <input
        type="month"
        value={currentMonth}
        onChange={(e) => goToMonth(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm"
      />
    </div>
  )
}
