import axios from 'axios'

// Get CSRF token from cookie
function getCsrfToken(): string | null {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value)
        }
    }
    return null
}

export const apiClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL) + '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Request interceptor: Add CSRF token for mutations
apiClient.interceptors.request.use(
    (config) => {
        // Add CSRF token for stateful Sanctum requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
            const csrfToken = getCsrfToken()
            if (csrfToken) {
                config.headers['X-XSRF-TOKEN'] = csrfToken
            }
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor: 401 → redirect to login, parse error messages
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth state and redirect to login
            window.location.href = '/login'
        }

        // Parse backend validation errors
        if (error.response?.data?.errors) {
            // Laravel validation errors
            const errors = error.response.data.errors
            const firstError = Object.values(errors)[0]
            const message = Array.isArray(firstError) ? firstError[0] : String(firstError)
            const err = new Error(message || 'Validation error')
            ;(err as { errors?: typeof errors }).errors = errors
            return Promise.reject(err)
        }

        // Parse simple error message
        if (error.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message))
        }

        return Promise.reject(error)
    }
)
