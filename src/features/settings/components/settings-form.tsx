/**
 * Settings Form Component
 * Full page form for updating system settings (no table, no modal)
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '../store/settings-store'

const settingsSchema = z.object({
  project_reminder_days: z
    .number()
    .int()
    .min(1, 'Minimal 1 hari'),
  attendance_radius_meters: z
    .number()
    .int()
    .min(10, 'Minimal 10 meter'),
  shift_reminder_hours: z
    .number()
    .int()
    .min(1, 'Minimal 1 jam'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export function SettingsForm() {
  const { data, isLoading, isSubmitting, fetchSettings, updateSettings } =
    useSettingsStore()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      project_reminder_days: 7,
      attendance_radius_meters: 150,
      shift_reminder_hours: 1,
    },
  })

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Reset form when data loads
  useEffect(() => {
    if (data) {
      form.reset({
        project_reminder_days: data.project_reminder_days,
        attendance_radius_meters: data.attendance_radius_meters,
        shift_reminder_hours: data.shift_reminder_hours,
      })
    }
  }, [data, form])

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings(values)
      toast.success('Settings updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings')
    }
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Reminder Days */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Project Reminder (days)
          </label>
          <Input
            type="number"
            min={1}
            placeholder="Contoh: 7"
            {...form.register('project_reminder_days', {
              valueAsNumber: true,
            })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Jumlah hari sebelum deadline untuk mengirim pengingat project.
          </p>
          {form.formState.errors.project_reminder_days && (
            <p className="text-sm text-red-500">
              {form.formState.errors.project_reminder_days.message}
            </p>
          )}
        </div>

        {/* Attendance Radius */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Attendance Radius (meters)
          </label>
          <Input
            type="number"
            min={10}
            placeholder="Contoh: 150"
            {...form.register('attendance_radius_meters', {
              valueAsNumber: true,
            })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Jarak maksimal (dalam meter) dari lokasi yang diizinkan untuk
            absensi.
          </p>
          {form.formState.errors.attendance_radius_meters && (
            <p className="text-sm text-red-500">
              {form.formState.errors.attendance_radius_meters.message}
            </p>
          )}
        </div>

        {/* Shift Reminder Hours */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Shift Reminder (hours)
          </label>
          <Input
            type="number"
            min={1}
            placeholder="Contoh: 1"
            {...form.register('shift_reminder_hours', {
              valueAsNumber: true,
            })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Jumlah jam sebelum shift dimulai untuk mengirim pengingat ke
            employee.
          </p>
          {form.formState.errors.shift_reminder_hours && (
            <p className="text-sm text-red-500">
              {form.formState.errors.shift_reminder_hours.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
