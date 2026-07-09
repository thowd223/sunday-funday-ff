import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Historical league data changes rarely and is much larger than the app
        // code — keep it in its own chunk so app updates don't bust its cache.
        manualChunks(id) {
          if (id.includes('/src/data/') && id.endsWith('.json')) return 'league-data'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
