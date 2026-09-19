/**
 * Clients Form Page Component
 * Full page form for create/edit client
 */
import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Save, Plus, Trash2, MapPin, Building2, User, Calendar, DollarSign, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AsyncSelect, type SelectOption } from '@/components/async-select'
import { MapPicker } from '@/components/map-picker'
import { useClientsStore } from '@/features/clients'
import { clientTypesApi } from '@/features/client-types/api/client-types-api'
import type {
  CreateAreaNested,
  CreatePosNested,
  CreateClientPayload,
  UpdateClientPayload,
  ClientDetail,
} from '@/features/clients/types/clients.types'

type FormValues = {
  client_type_id: number | undefined
  name: string
  code: string
  email: string
  password: string
  phone: string
  address: string
  start_date: string
  end_date: string
  total_fee: string
  discount: string
  service_price: string
  status: string
}

// Hierarchical area with nested poss
interface AreaWithPoss extends CreateAreaNested {
  id: string
  poss: CreatePosNested[]
}

export function ClientsForm() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = Boolean(id)
  const clientId = isEdit ? Number(id) : undefined

  const {
    selectedItem,
    isLoading,
    isSubmitting,
    fetchById,
    create,
    update,
    resetForm,
  } = useClientsStore()

  // Hierarchical state: areas contain poss
  const [nestedAreas, setNestedAreas] = useState<AreaWithPoss[]>([])
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())

  const form = useForm<FormValues>({
    defaultValues: {
      client_type_id: undefined,
      name: '',
      code: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      start_date: '',
      end_date: '',
      total_fee: '',
      discount: '',
      service_price: '',
      status: '1',
    },
  })

  // Fetch data for edit mode
  useEffect(() => {
    if (isEdit && clientId) {
      fetchById(clientId)
    } else {
      resetForm()
    }
  }, [isEdit, clientId, fetchById, resetForm])

  // Populate form when data is loaded
  useEffect(() => {
    if (isEdit && selectedItem) {
      form.reset({
        client_type_id: selectedItem.client_type_id,
        name: selectedItem.name,
        code: selectedItem.code ?? '',
        email: selectedItem.email ?? '',
        password: '',
        phone: selectedItem.phone ?? '',
        address: selectedItem.address ?? '',
        start_date: selectedItem.start_date ?? '',
        end_date: selectedItem.end_date ?? '',
        total_fee: selectedItem.total_fee?.toString() ?? '',
        discount: selectedItem.discount?.toString() ?? '',
        service_price: selectedItem.service_price?.toString() ?? '',
        status: selectedItem.status?.toString() ?? '1',
      })

      // Transform areas with poss to hierarchical structure
      const detail = selectedItem as ClientDetail
      if (detail.areas && detail.areas.length > 0) {
        setNestedAreas(detail.areas.map((area) => ({
          id: area.id.toString(),
          name: area.name,
          latitude: area.latitude,
          longitude: area.longitude,
          description: area.description,
          poss: area.poss?.map((pos) => ({
            name: pos.name,
            latitude: pos.latitude,
            longitude: pos.longitude,
            description: pos.description,
          })) ?? [],
        })))
      }
    }
  }, [isEdit, selectedItem, form])

  // Load client types for dropdown
  const loadClientTypes = useCallback(async (search: string): Promise<SelectOption[]> => {
    try {
      const response = await clientTypesApi.getSelectOptions({ q: search })
      return response.data.map((ct) => ({
        value: ct.id,
        label: ct.name,
      }))
    } catch {
      return []
    }
  }, [])

  // Toggle area expansion
  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev)
      if (next.has(areaId)) {
        next.delete(areaId)
      } else {
        next.add(areaId)
      }
      return next
    })
  }

  // Add new area
  const addArea = () => {
    const newArea: AreaWithPoss = {
      id: `new-${Date.now()}`,
      name: '',
      latitude: '',
      longitude: '',
      description: '',
      poss: [],
    }
    setNestedAreas((prev) => [...prev, newArea])
    setExpandedAreas((prev) => new Set([...prev, newArea.id]))
  }

  // Remove area
  const removeArea = (areaId: string) => {
    setNestedAreas((prev) => prev.filter((a) => a.id !== areaId))
  }

  // Update area
  const updateArea = (areaId: string, updates: Partial<AreaWithPoss>) => {
    setNestedAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, ...updates } : a))
    )
  }

  // Add POS to area
  const addPos = (areaId: string) => {
    const newPos: CreatePosNested = {
      name: '',
      latitude: '',
      longitude: '',
      description: '',
    }
    setNestedAreas((prev) =>
      prev.map((a) =>
        a.id === areaId ? { ...a, poss: [...(a.poss || []), newPos] } : a
      )
    )
  }

  // Remove POS from area
  const removePos = (areaId: string, posIndex: number) => {
    setNestedAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? { ...a, poss: a.poss?.filter((_, i) => i !== posIndex) ?? [] }
          : a
      )
    )
  }

  // Update POS
  const updatePos = (areaId: string, posIndex: number, updates: Partial<CreatePosNested>) => {
    setNestedAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? {
              ...a,
              poss: a.poss?.map((p, i) =>
                i === posIndex ? { ...p, ...updates } : p
              ) ?? [],
            }
          : a
      )
    )
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!values.client_type_id) {
      toast.error('Tipe client wajib dipilih')
      return
    }
    if (!values.name.trim()) {
      toast.error('Nama client wajib diisi')
      return
    }
    if (!isEdit && !values.password) {
      toast.error('Password wajib diisi')
      return
    }

    // Validate areas
    const validAreas: CreateAreaNested[] = nestedAreas
      .filter((a) => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        latitude: a.latitude?.trim() || undefined,
        longitude: a.longitude?.trim() || undefined,
        description: a.description?.trim() || undefined,
        poss: a.poss
          ?.filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            latitude: p.latitude?.trim() || undefined,
            longitude: p.longitude?.trim() || undefined,
            description: p.description?.trim() || undefined,
          })),
      }))

    try {
      if (!isEdit) {
        const createPayload: CreateClientPayload = {
          client_type_id: values.client_type_id,
          name: values.name.trim(),
          address: values.address.trim() || undefined,
          phone: values.phone.trim() || undefined,
          email: values.email.trim() || undefined,
          code: values.code.trim() || undefined,
          password: values.password,
          start_date: values.start_date || undefined,
          end_date: values.end_date || undefined,
          total_fee: values.total_fee ? Number(values.total_fee) : undefined,
          discount: values.discount ? Number(values.discount) : undefined,
          service_price: values.service_price ? Number(values.service_price) : undefined,
          status: Number(values.status),
        }
        if (validAreas.length > 0) createPayload.areas = validAreas

        await create(createPayload)
        toast.success('Client berhasil ditambahkan')
      } else if (clientId) {
        const updatePayload: UpdateClientPayload = {
          client_type_id: values.client_type_id,
          name: values.name.trim(),
          address: values.address.trim() || undefined,
          phone: values.phone.trim() || undefined,
          email: values.email.trim() || undefined,
          code: values.code.trim() || undefined,
          start_date: values.start_date || undefined,
          end_date: values.end_date || undefined,
          total_fee: values.total_fee ? Number(values.total_fee) : undefined,
          discount: values.discount ? Number(values.discount) : undefined,
          service_price: values.service_price ? Number(values.service_price) : undefined,
          status: Number(values.status),
        }
        if (values.password) updatePayload.password = values.password
        if (validAreas.length > 0) updatePayload.areas = validAreas

        await update(clientId, updatePayload)
        toast.success('Client berhasil diperbarui')
      }
      navigate({ to: '/master-data' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  // Loading skeleton for edit mode
  if (isLoading && isEdit) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Client' : 'Tambah Client Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit ? 'Perbarui informasi client' : 'Lengkapi informasi client baru'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: '/master-data' })}>
          Batal
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informasi Dasar
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Client *</label>
              <AsyncSelect
                value={form.watch('client_type_id') ?? null}
                onChange={(value) => form.setValue('client_type_id', value as number | undefined)}
                loadOptions={loadClientTypes}
                placeholder="Pilih tipe client..."
                isDisabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Client *</label>
              <Input
                placeholder="Nama client"
                {...form.register('name', { required: 'Nama client wajib diisi' })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kode</label>
              <Input
                placeholder="Auto-generate jika kosong"
                {...form.register('code')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <AsyncSelect
                loadOptions={async () => [
                  { value: '1', label: 'Aktif' },
                  { value: '0', label: 'Tidak Aktif' },
                ]}
                value={form.watch('status') || '1'}
                onChange={(val) => form.setValue('status', (val as string) || '1')}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Kontak
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                {...form.register('email')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input
                placeholder="08xxxxxxxxxx"
                {...form.register('phone')}
              />
            </div>

            {isEdit ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <Input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  {...form.register('password')}
                />
                <p className="text-xs text-muted-foreground">
                  Isi hanya jika ingin mengubah password
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  {...form.register('password', { required: 'Password wajib diisi' })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Alamat</label>
            <textarea
              placeholder="Alamat lengkap"
              {...form.register('address')}
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-transparent"
            />
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informasi Project
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input
                type="date"
                {...form.register('start_date')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <Input
                type="date"
                {...form.register('end_date')}
              />
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Informasi Finansial
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Fee (IDR)</label>
              <Input
                type="number"
                placeholder="0"
                {...form.register('total_fee')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Diskon (IDR)</label>
              <Input
                type="number"
                placeholder="0"
                {...form.register('discount')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Price (IDR)</label>
              <Input
                type="number"
                placeholder="0"
                {...form.register('service_price')}
              />
            </div>
          </div>
        </div>

        {/* Areas & POS - Hierarchical */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Areas & POS
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addArea}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Area
            </Button>
          </div>

          {nestedAreas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada area ditambahkan</p>
              <p className="text-sm">Klik tombol "Tambah Area" untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nestedAreas.map((area) => (
                <div key={area.id} className="border rounded-lg overflow-hidden">
                  {/* Area Header */}
                  <div
                    className="flex items-center gap-2 p-4 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleArea(area.id)}
                  >
                    {expandedAreas.has(area.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Input
                      placeholder="Nama Area"
                      value={area.name}
                      onChange={(e) => updateArea(area.id, { name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 max-w-xs"
                    />
                    <span className="text-sm text-muted-foreground">
                      {area.poss?.length ?? 0} POS
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeArea(area.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Area Content */}
                  {expandedAreas.has(area.id) && (
                    <div className="p-4 space-y-4">
                      {/* Area Details */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Latitude</label>
                          <Input
                            placeholder="Latitude"
                            value={area.latitude ?? ''}
                            onChange={(e) => updateArea(area.id, { latitude: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Longitude</label>
                          <Input
                            placeholder="Longitude"
                            value={area.longitude ?? ''}
                            onChange={(e) => updateArea(area.id, { longitude: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Description</label>
                          <Input
                            placeholder="Deskripsi"
                            value={area.description ?? ''}
                            onChange={(e) => updateArea(area.id, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Map Picker */}
                      <MapPicker
                        lat={area.latitude ? Number(area.latitude) : undefined}
                        lng={area.longitude ? Number(area.longitude) : undefined}
                        onChange={(lat, lng) => {
                          updateArea(area.id, {
                            latitude: lat?.toString() ?? '',
                            longitude: lng?.toString() ?? '',
                          })
                        }}
                      />

                      {/* POS List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">POS (Point of Service)</label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addPos(area.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Tambah POS
                          </Button>
                        </div>

                        {(area.poss ?? []).map((pos, posIndex) => (
                          <div key={posIndex} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input
                                placeholder="Nama POS"
                                value={pos.name}
                                onChange={(e) => updatePos(area.id, posIndex, { name: e.target.value })}
                                className="flex-1"
                              />
                              <Input
                                placeholder="Latitude"
                                value={pos.latitude ?? ''}
                                onChange={(e) => updatePos(area.id, posIndex, { latitude: e.target.value })}
                              />
                              <Input
                                placeholder="Longitude"
                                value={pos.longitude ?? ''}
                                onChange={(e) => updatePos(area.id, posIndex, { longitude: e.target.value })}
                              />
                              <Input
                                placeholder="Deskripsi"
                                value={pos.description ?? ''}
                                onChange={(e) => updatePos(area.id, posIndex, { description: e.target.value })}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePos(area.id, posIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/master-data' })}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
