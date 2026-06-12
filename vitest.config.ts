import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Standalone test config — deliberately omits the tanstackStart() plugin so
// component/logic tests run in plain jsdom without the server runtime.
export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
      '#': new URL('./src/', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
