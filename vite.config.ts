import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => ({
  plugins: [
    react(), // Note: Double-invoke effects in dev are expected (React StrictMode behavior)
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: `${import.meta.env.VITE_API_URL}`,
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: `${import.meta.env.VITE_API_URL}`,
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: `${import.meta.env.VITE_API_URL}`,
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: `${import.meta.env.VITE_API_URL}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
