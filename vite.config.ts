import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

const config = defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
      '#': srcDir,
    },
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), netlify(), viteReact()],
})

export default config
