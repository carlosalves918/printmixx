import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: troque 'printmixx' pelo nome exato do seu repositório no GitHub
// se o repositório tiver outro nome. Isso é necessário para o GitHub Pages
// servir os arquivos no caminho correto (https://usuario.github.io/nome-do-repo/).
export default defineConfig({
  plugins: [react()],
  base: '/printmixx/',
})
