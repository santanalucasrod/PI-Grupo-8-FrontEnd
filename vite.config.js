import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//adiciona bibliotecas 
export default defineConfig({
  plugins: [react()],
})
