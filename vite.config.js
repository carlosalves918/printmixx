import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' funciona para Vercel, Netlify, ou qualquer domínio próprio
// onde o site fica na RAIZ do domínio (ex: printmixx.vercel.app, printmixx.com.br).
//
// Só use um caminho como '/printmixx/' se for publicar especificamente no
// GitHub Pages em https://usuario.github.io/printmixx/ (subpasta, não raiz).
export default defineConfig({
  plugins: [react()],
  base: '/',
})
