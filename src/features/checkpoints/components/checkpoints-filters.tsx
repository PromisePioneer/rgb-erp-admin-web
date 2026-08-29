/**
 * Checkpoints Filters Component
 */
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCheckpointsStore } from '../store/checkpoints-store'

export function CheckpointsFilters() {
  const { filters, setFilters, resetFilters, projectsOptions, fetchProjectsOptions } = useCheckpointsStore()

  // Fetch projects on mount if not loaded
  if (projectsOptions.length === 0) {
    fetchProjectsOptions()
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name or code..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>

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
          {projectsOptions.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) =>
          setFilters({ status: value === 'all' ? undefined : value as 'active' | 'inactive' })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {(filters.search || filters.project_id || filters.status) && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
