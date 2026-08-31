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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  ClientArea,
  ClientPos,
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
    }
  }, [isEdit, selectedItem, form])

  // Populate nested areas when editing
  useEffect(() => {
    if (isEdit && selectedItem) {
      const detail = selectedItem as ClientDetail
      if (detail.areas && Array.isArray(detail.areas)) {
        const loadedAreas: AreaWithPoss[] = detail.areas.map((area: ClientArea) => ({
          id: `existing-${area.id}`,
          name: area.name,
          latitude: area.latitude ?? '',
          longitude: area.longitude ?? '',
          description: area.description ?? '',
          poss: (area.poss ?? []).map((pos: ClientPos) => ({
            name: pos.name,
            latitude: pos.latitude ?? '',
            longitude: pos.longitude ?? '',
            description: pos.description ?? '',
          })),
        }))
        setNestedAreas(loadedAreas)
        // Expand all areas by default
        setExpandedAreas(new Set(loadedAreas.map(a => a.id)))
      }
    } else {
      // Reset nested areas when creating new client
      setNestedAreas([])
      setExpandedAreas(new Set())
    }
  }, [isEdit, selectedItem])

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

  // Area handlers
  const handleAddArea = () => {
    const newArea: AreaWithPoss = {
      id: `new-${Date.now()}`,
      name: '',
      latitude: '',
      longitude: '',
      description: '',
      poss: [],
    }
    setNestedAreas([...nestedAreas, newArea])
    setExpandedAreas(new Set([...expandedAreas, newArea.id]))
  }

  const handleRemoveArea = (areaId: string) => {
    setNestedAreas(nestedAreas.filter(a => a.id !== areaId))
  }

  const handleUpdateArea = (areaId: string, field: keyof CreateAreaNested, value: string) => {
    setNestedAreas(nestedAreas.map(a =>
      a.id === areaId ? { ...a, [field]: value } : a
    ))
  }

  const toggleExpandArea = (areaId: string) => {
    const newExpanded = new Set(expandedAreas)
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId)
    } else {
      newExpanded.add(areaId)
    }
    setExpandedAreas(newExpanded)
  }

  // Pos handlers (nested under area)
  const handleAddPos = (areaId: string) => {
    const newPos: CreatePosNested = {
      name: '',
      latitude: '',
      longitude: '',
      description: '',
    }
    setNestedAreas(nestedAreas.map(a =>
      a.id === areaId ? { ...a, poss: [...a.poss, newPos] } : a
    ))
  }

  const handleRemovePos = (areaId: string, posIndex: number) => {
    setNestedAreas(nestedAreas.map(a =>
      a.id === areaId
        ? { ...a, poss: a.poss.filter((_, i) => i !== posIndex) }
        : a
    ))
  }

  const handleUpdatePos = (areaId: string, posIndex: number, field: keyof CreatePosNested, value: string) => {
    setNestedAreas(nestedAreas.map(a =>
      a.id === areaId
        ? {
            ...a,
            poss: a.poss.map((p, i) =>
              i === posIndex ? { ...p, [field]: value } : p
            ),
          }
        : a
    ))
  }

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

    try {
      // Build nested areas with valid poss
      const validAreas: CreateAreaNested[] = nestedAreas
        .filter(a => a.name.trim())
        .map(a => ({
          name: a.name.trim(),
          latitude: a.latitude?.trim() || undefined,
          longitude: a.longitude?.trim() || undefined,
          description: a.description?.trim() || undefined,
          poss: a.poss
            .filter(p => p.name.trim())
            .map(p => ({
              name: p.name.trim(),
              latitude: p.latitude?.trim() || undefined,
              longitude: p.longitude?.trim() || undefined,
              description: p.description?.trim() || undefined,
            })),
        }))

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
        // Include areas in update (will replace existing areas in backend)
        if (validAreas.length > 0) updatePayload.areas = validAreas

        await update(clientId, updatePayload)
        toast.success('Client berhasil diperbarui')
      }
      navigate({ to: '/clients' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
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
        <Button variant="outline" onClick={() => navigate({ to: '/clients' })}>
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
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value ?? '1')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
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

            {!isEdit && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  {...form.register('password', { required: 'Password wajib diisi' })}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Alamat</label>
              <textarea
                placeholder="Alamat lengkap"
                {...form.register('address')}
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-transparent"
              />
            </div>
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

        {/* Hierarchical Areas -> Poss */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Area & Pos (Opsional)
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddArea}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Area
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Tambahkan area dan poss saat membuat client (opsional)
          </p>

          {nestedAreas.length > 0 && (
            <div className="space-y-4">
              {nestedAreas.map((area, areaIndex) => (
                <div key={area.id} className="border rounded-lg overflow-hidden">
                  {/* Area Header */}
                  <div className="flex items-center gap-2 p-4 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleExpandArea(area.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {expandedAreas.has(area.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="text-sm font-medium">Area #{areaIndex + 1}</span>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveArea(area.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Area Content */}
                  {expandedAreas.has(area.id) && (
                    <div className="p-4 space-y-4 border-t">
                      {/* Area Fields */}
                      <div className="space-y-3">
                        <Input
                          placeholder="Nama area *"
                          value={area.name}
                          onChange={(e) => handleUpdateArea(area.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Deskripsi"
                          value={area.description}
                          onChange={(e) => handleUpdateArea(area.id, 'description', e.target.value)}
                        />
                      </div>

                      {/* Area Coordinates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                          <Input
                            placeholder="-6.2088"
                            value={area.latitude}
                            onChange={(e) => handleUpdateArea(area.id, 'latitude', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                          <Input
                            placeholder="106.8456"
                            value={area.longitude}
                            onChange={(e) => handleUpdateArea(area.id, 'longitude', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Area MapPicker */}
                      <div className="border rounded-lg p-3 bg-muted/20">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Lokasi Area (klik map atau cari lokasi)</label>
                        <MapPicker
                          lat={area.latitude}
                          lng={area.longitude}
                          onChange={(lat, lng) => {
                            handleUpdateArea(area.id, 'latitude', lat ?? '')
                            handleUpdateArea(area.id, 'longitude', lng ?? '')
                          }}
                          label=""
                        />
                      </div>

                      {/* Nested Poss under this Area */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            Pos dalam Area ini
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddPos(area.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Tambah Pos
                          </Button>
                        </div>

                        {area.poss.length > 0 ? (
                          <div className="space-y-3 pl-4 border-l-2 border-muted">
                            {area.poss.map((pos, posIndex) => (
                              <div key={posIndex} className="border rounded-lg p-3 bg-muted/10">
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <Input
                                    placeholder="Nama pos *"
                                    className="flex-1"
                                    value={pos.name}
                                    onChange={(e) => handleUpdatePos(area.id, posIndex, 'name', e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePos(area.id, posIndex)}
                                    className="text-destructive hover:text-destructive p-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {/* Pos Coordinates */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                                    <Input
                                      placeholder="-6.2088"
                                      className="h-8 text-sm"
                                      value={pos.latitude}
                                      onChange={(e) => handleUpdatePos(area.id, posIndex, 'latitude', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                                    <Input
                                      placeholder="106.8456"
                                      className="h-8 text-sm"
                                      value={pos.longitude}
                                      onChange={(e) => handleUpdatePos(area.id, posIndex, 'longitude', e.target.value)}
                                    />
                                  </div>
                                </div>
                                {/* Pos MapPicker */}
                                <MapPicker
                                  lat={pos.latitude}
                                  lng={pos.longitude}
                                  onChange={(lat, lng) => {
                                    handleUpdatePos(area.id, posIndex, 'latitude', lat ?? '')
                                    handleUpdatePos(area.id, posIndex, 'longitude', lng ?? '')
                                  }}
                                  label=""
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic pl-4">
                            Belum ada pos. Klik "Tambah Pos" untuk menambahkan.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {nestedAreas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada area. Klik "Tambah Area" untuk memulai.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/clients' })}>
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
