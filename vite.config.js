import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'production' ? [viteSingleFile()] : []),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
}))


