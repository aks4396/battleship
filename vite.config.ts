import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ['src/__tests__/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
