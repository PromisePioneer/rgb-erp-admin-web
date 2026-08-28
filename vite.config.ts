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
        target: 'https://testing-erp-ges.tech',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'https://testing-erp-ges.tech',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'https://testing-erp-ges.tech',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://testing-erp-ges.tech',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
