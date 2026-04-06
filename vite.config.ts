import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base settes til '/topptur/' ved deploy til GitHub Pages
  // For lokal bygging kan du la det stå som '/'
  base: './',
})
