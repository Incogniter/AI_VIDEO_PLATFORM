import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = id.replaceAll('\\', '/')
          if (modulePath.includes('/node_modules/@supabase/')) return 'supabase'
          if (modulePath.includes('/node_modules/@mui/') || modulePath.includes('/node_modules/@emotion/')) return 'mui'
          if (modulePath.includes('/node_modules/react/') || modulePath.includes('/node_modules/react-dom/') || modulePath.includes('/node_modules/scheduler/')) return 'react-vendor'
        },
      },
    },
  },
})
