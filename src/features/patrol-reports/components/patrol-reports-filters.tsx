/**
 * Patrol Reports Filters Component
 */
import { useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePatrolReportsStore } from '../store/patrol-reports-store'
import type { PatrolReportsFilters as FiltersType } from '../types/patrol-reports.types'

export function PatrolReportsFilters() {
  const { filters, setFilters, resetFilters, projects, fetchProjects } = usePatrolReportsStore()

  // Fetch projects on mount if not loaded
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects()
    }
  }, [projects.length, fetchProjects])

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Month picker */}
      <div className="relative w-[140px]">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="month"
          value={filters.month ?? currentMonth}
          onChange={(e) => setFilters({ month: e.target.value || undefined })}
          className="pl-9"
        />
      </div>

      {/* Project filter */}
      <Select
        value={filters.project_id?.toString() ?? 'all'}
        onValueChange={(value) => {
          if (value) {
            setFilters({ project_id: value === 'all' ? undefined : parseInt(value) })
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) => {
          if (value) {
            setFilters({
              status: value === 'all' ? undefined : (value as FiltersType['status']),
            })
          }
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="incomplete">Incomplete</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear button */}
      {(filters.month !== currentMonth || filters.project_id || filters.status) && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
