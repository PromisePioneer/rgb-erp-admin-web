import {toast} from 'sonner'
import {CheckCircle2, XCircle, AlertTriangle, Info} from 'lucide-react'

/**
 * App-specific toast helper with icons
 */
export const appToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    })
  },

  info: (message: string, description?: string) => {
    toast(message, {
      description,
      icon: <Info className="h-5 w-5 text-blue-500" />,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: (data: T) => {
        const msg = typeof messages.success === 'function'
          ? messages.success(data)
          : messages.success
        return {
          message: msg,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        }
      },
      error: (err: Error) => {
        const msg = typeof messages.error === 'function'
          ? messages.error(err)
          : messages.error
        return {
          message: msg,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        }
      },
    })
  },
}

// Re-export default toast for direct usage
export {toast}
