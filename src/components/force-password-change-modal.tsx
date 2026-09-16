/**
 * Force Password Change Component
 * Blocks user access until they change their password
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'

const changePasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  new_password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).superRefine((data, ctx) => {
  if (data.new_password !== data.new_password_confirmation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password baru dan konfirmasi tidak cocok',
      path: ['new_password_confirmation'],
    })
  }
})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ForcePasswordChangeModal() {
  const { user, changePassword } = useAuthStore()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      new_password: '',
      new_password_confirmation: '',
    },
    mode: 'onTouched',
  })

  // Only show if force_password_change is true
  if (!user?.force_password_change) {
    return null
  }

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true)
    try {
      // For force password change, current password is not required (user has default password)
      await changePassword('', values.new_password)
      toast.success('Password berhasil diubah. Silakan login ulang.')
      // Force logout after password change
      window.location.href = '/logout'
    } catch (error: any) {
      const message = error?.response?.data?.errors?.current_password?.[0]
        || error?.message
        || 'Gagal mengubah password'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold">Ubah Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda harus mengubah password sebelum dapat mengakses aplikasi.
            Password default sudah tidak dapat digunakan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                className="pl-10 pr-10"
                {...form.register('new_password')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.new_password && (
              <p className="text-sm text-red-500">{form.formState.errors.new_password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                className="pl-10 pr-10"
                {...form.register('new_password_confirmation')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.new_password_confirmation && (
              <p className="text-sm text-red-500">{form.formState.errors.new_password_confirmation.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            <strong>Tips:</strong> Gunakan password yang mudah diingat tapi sulit ditebak.
            Jangan gunakan password yang sama dengan akun lain.
          </p>
        </div>
      </div>
    </div>
  )
}
