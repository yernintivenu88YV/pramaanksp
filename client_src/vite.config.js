import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pramaanksp/',
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/server': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../client',
    emptyOutDir: false, // Prevent deleting client-package.json
    rollupOptions: {
      external: [
        '/__catalyst/sdk/init.js'
      ]
    }
  }
})
