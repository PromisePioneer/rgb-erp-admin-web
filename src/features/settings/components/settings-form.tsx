/**
 * Settings Form Component
 * Full page form for updating system settings (no table, no modal)
 */
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Settings2, Image, X, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsStore } from '@/features/settings'
import type { UpdateSettingsPayloadWithFiles } from '@/features/settings'

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
  app_title: z.string().min(1, 'Judul aplikasi wajib diisi'),
  company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
  company_tagline: z.string().optional(),
  company_description: z.string().optional(),
  ops_absensi_status: z.string(),
  ops_patroli_status: z.string(),
  ops_panic_status: z.string(),
  ops_enrollment_status: z.string(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

// OPS Status options
const statusOptions = [
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Siaga', label: 'Siaga' },
  { value: 'Tidak Aktif', label: 'Tidak Aktif' },
]

export function SettingsForm() {
  const { data, isLoading, isSubmitting, fetchSettings, updateSettings } =
    useSettingsStore()

  const [appLogoPreview, setAppLogoPreview] = useState<string | null>(null)
  const [loginImagePreview, setLoginImagePreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  const appLogoRef = useRef<HTMLInputElement>(null)
  const loginImageRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)

  const [pendingFiles, setPendingFiles] = useState<{
    app_logo?: File | null
    login_image?: File | null
    favicon?: File | null
  }>({})

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      project_reminder_days: 7,
      attendance_radius_meters: 150,
      shift_reminder_hours: 1,
      app_title: 'RGB ERP',
      company_name: 'PT. Rajawali Buana 86 (RGB 86)',
      company_tagline: 'Bermitra Bersama Kami dan Raih Sukses Bersama.',
      company_description: 'Perusahaan outsourcing sejak 2009.\nMelayani: Security, Cleaning, Catering, Parking, Gardener, Driver & lainnya.',
      ops_absensi_status: 'Aktif',
      ops_patroli_status: 'Aktif',
      ops_panic_status: 'Siaga',
      ops_enrollment_status: 'Aktif',
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
        app_title: data.app_title || 'RGB ERP',
        company_name: data.company_name || 'PT. Rajawali Buana 86 (RGB 86)',
        company_tagline: data.company_tagline || '',
        company_description: data.company_description || '',
        ops_absensi_status: data.ops_absensi_status || 'Aktif',
        ops_patroli_status: data.ops_patroli_status || 'Aktif',
        ops_panic_status: data.ops_panic_status || 'Siaga',
        ops_enrollment_status: data.ops_enrollment_status || 'Aktif',
      })
      setAppLogoPreview(data.app_logo)
      setLoginImagePreview(data.login_image)
      setFaviconPreview(data.favicon)
    }
  }, [data, form])

  const handleFileChange = (
    field: 'app_logo' | 'login_image' | 'favicon',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFiles(prev => ({ ...prev, [field]: file }))
      const previewUrl = URL.createObjectURL(file)
      if (field === 'app_logo') setAppLogoPreview(previewUrl)
      if (field === 'login_image') setLoginImagePreview(previewUrl)
      if (field === 'favicon') setFaviconPreview(previewUrl)
    }
  }

  const clearFile = (field: 'app_logo' | 'login_image' | 'favicon') => {
    setPendingFiles(prev => ({ ...prev, [field]: null }))
    if (field === 'app_logo') {
      setAppLogoPreview(data?.app_logo || null)
      if (appLogoRef.current) appLogoRef.current.value = ''
    }
    if (field === 'login_image') {
      setLoginImagePreview(data?.login_image || null)
      if (loginImageRef.current) loginImageRef.current.value = ''
    }
    if (field === 'favicon') {
      setFaviconPreview(data?.favicon || null)
      if (faviconRef.current) faviconRef.current.value = ''
    }
  }

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const payload: UpdateSettingsPayloadWithFiles = {
        ...values,
        ...pendingFiles,
      }
      await updateSettings(payload)
      setPendingFiles({})
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
    <div className="max-w-4xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Branding Section */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Branding & Identitas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* App Logo */}
            <div className="space-y-2">
              <Label>Logo Aplikasi</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 w-20 h-20 flex items-center justify-center bg-muted/50">
                  {appLogoPreview ? (
                    <img
                      src={appLogoPreview}
                      alt="App Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    ref={appLogoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('app_logo', e)}
                    className="text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, max 2MB</p>
                </div>
                {appLogoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFile('app_logo')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* App Title */}
            <div className="space-y-2">
              <Label htmlFor="app_title">Judul Aplikasi</Label>
              <Input
                id="app_title"
                {...form.register('app_title')}
                placeholder="RGB ERP"
              />
              {form.formState.errors.app_title && (
                <p className="text-sm text-red-500">{form.formState.errors.app_title.message}</p>
              )}
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Nama Perusahaan</Label>
            <Input
              id="company_name"
              {...form.register('company_name')}
              placeholder="PT. Nama Perusahaan"
            />
            {form.formState.errors.company_name && (
              <p className="text-sm text-red-500">{form.formState.errors.company_name.message}</p>
            )}
          </div>

          {/* Company Tagline */}
          <div className="space-y-2">
            <Label htmlFor="company_tagline">Tagline</Label>
            <Input
              id="company_tagline"
              {...form.register('company_tagline')}
              placeholder="Bermitra Bersama Kami dan Raih Sukses Bersama."
            />
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="company_description">Deskripsi Perusahaan</Label>
            <Textarea
              id="company_description"
              {...form.register('company_description')}
              placeholder="Deskripsi singkat perusahaan..."
              rows={3}
            />
          </div>

          {/* Login Image */}
          <div className="space-y-2">
            <Label> Gambar Login</Label>
            <div className="flex items-center gap-4">
              <div className="border-2 border-dashed rounded-lg p-2 w-32 h-20 flex items-center justify-center bg-muted/50 overflow-hidden">
                {loginImagePreview ? (
                  <img
                    src={loginImagePreview}
                    alt="Login Background"
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  ref={loginImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('login_image', e)}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, max 5MB</p>
              </div>
              {loginImagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => clearFile('login_image')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <Label> Favicon (Tab Browser)</Label>
            <div className="flex items-center gap-4">
              <div className="border-2 border-dashed rounded-lg p-2 w-12 h-12 flex items-center justify-center bg-muted/50">
                {faviconPreview ? (
                  <img
                    src={faviconPreview}
                    alt="Favicon"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  ref={faviconRef}
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  onChange={(e) => handleFileChange('favicon', e)}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">PNG, ICO, SVG, max 1MB</p>
              </div>
              {faviconPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => clearFile('favicon')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* OPS Module Status Section */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Status Modul Operasional</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Absensi Status */}
            <div className="space-y-2">
              <Label htmlFor="ops_absensi_status">Absensi & Jadwal Kerja</Label>
              <select
                id="ops_absensi_status"
                {...form.register('ops_absensi_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Patroli Status */}
            <div className="space-y-2">
              <Label htmlFor="ops_patroli_status">Patroli & Checkpoint</Label>
              <select
                id="ops_patroli_status"
                {...form.register('ops_patroli_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Panic Button Status */}
            <div className="space-y-2">
              <Label htmlFor="ops_panic_status">Panic Button</Label>
              <select
                id="ops_panic_status"
                {...form.register('ops_panic_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Enrollment Status */}
            <div className="space-y-2">
              <Label htmlFor="ops_enrollment_status">Enrollment Wajah</Label>
              <select
                id="ops_enrollment_status"
                {...form.register('ops_enrollment_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* General Settings Section */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Pengaturan Umum</h3>
          </div>

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
              Jarak maksimal (dalam meter) dari lokasi yang diizinkan untuk absensi.
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
              Jumlah jam sebelum shift dimulai untuk mengirim pengingat ke employee.
            </p>
            {form.formState.errors.shift_reminder_hours && (
              <p className="text-sm text-red-500">
                {form.formState.errors.shift_reminder_hours.message}
              </p>
            )}
          </div>
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
