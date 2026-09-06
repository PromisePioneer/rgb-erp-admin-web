import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Create Echo instance for Reverb
const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || '',
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  scheme: (import.meta.env.VITE_REVERB_SCHEME as 'http' | 'https') || 'http',
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  disableStats: true,
})

export default echo

// Export Pusher for type compatibility
export { Pusher }
