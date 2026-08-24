/**
 * Clients Form Component
 * Create and edit form using react-hook-form + zod
 */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useClientsStore } from '../store/clients-store'

const clientFormSchema = z.object({
  client_type_id: z.number().min(1, 'Client type is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  address: z.string().min(1, 'Address is required').max(255, 'Address is too long'),
  phone: z.string().min(1, 'Phone is required').max(255, 'Phone is too long'),
  status: z.number().min(0).max(1),
  lat: z.string().optional().nullable(),
  lng: z.string().optional().nullable(),
  radius_meters: z.number().optional().nullable(),
  service_price: z.number().optional().nullable(),
  expired_date: z.string().optional().nullable(),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientsFormProps {
  mode: 'create' | 'edit'
  clientId?: number
}

export function ClientsForm({ mode, clientId }: ClientsFormProps) {
  const navigate = useNavigate()
  const {
    selectedItem,
    isLoading,
    isSubmitting,
    error,
    fetchById,
    fetchClientTypes,
    clientTypes,
    create,
    update,
    clearError,
  } = useClientsStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch client types on mount
  useEffect(() => {
    fetchClientTypes()
  }, [fetchClientTypes])

  // Fetch client data if editing
  useEffect(() => {
    if (mode === 'edit' && clientId) {
      fetchById(clientId)
    }
  }, [mode, clientId, fetchById])

  // Set form with existing data when available
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      client_type_id: 0,
      name: '',
      address: '',
      phone: '',
      status: 1,
      lat: null,
      lng: null,
      radius_meters: null,
      service_price: null,
      expired_date: null,
    },
  })

  // Update form values when selectedItem is loaded
  useEffect(() => {
    if (mode === 'edit' && selectedItem) {
      form.reset({
        client_type_id: selectedItem.client_type_id,
        name: selectedItem.name,
        address: selectedItem.address ?? '',
        phone: selectedItem.phone ?? '',
        status: selectedItem.status,
        lat: selectedItem.lat,
        lng: selectedItem.lng,
        radius_meters: selectedItem.radius_meters,
        service_price: selectedItem.service_price,
        expired_date: selectedItem.expired_date,
      })
    }
  }, [mode, selectedItem, form])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const onSubmit = async (values: ClientFormValues) => {
    setSubmitError(null)
    try {
      if (mode === 'create') {
        await create(values)
        navigate({ to: '/clients' })
      } else if (clientId) {
        await update(clientId, values)
        navigate({ to: '/clients' })
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Add New Client' : 'Edit Client'}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {submitError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="client_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Type *</FormLabel>
                <Select
                  value={field.value?.toString() ?? ''}
                  onValueChange={(value) => field.onChange(value ? Number.parseInt(value, 10) : 0)}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="service_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number.parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value?.toString() ?? '1'}
                    onValueChange={(value) => field.onChange(value ? Number.parseInt(value, 10) : 1)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expired_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expired Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              Geofence Settings (Optional)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="-6.2"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="106.8"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="radius_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radius (meters)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number.parseInt(e.target.value, 10) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription className="mt-2">
              Geofence settings allow tracking employee attendance within a specific radius of the client location.
            </FormDescription>
          </div>

          <div className="flex gap-3 pt-4">
            <Link to="/clients">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
