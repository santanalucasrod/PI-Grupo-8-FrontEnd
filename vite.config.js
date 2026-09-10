import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//adiciona bibliotecas 
const apiProxy = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    // Em dev local (npm run dev), o Vite faz o mesmo papel que o Nginx
    // faz na nuvem: repassa /api/* para o backend.
    proxy: apiProxy,
  },
  preview: {
    // mesmo proxy, para quando voce testa o build de producao com "npm run preview"
    proxy: apiProxy,
  },
})
