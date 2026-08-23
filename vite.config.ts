import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages redirects this project to its custom domain, so assets must
  // resolve from the domain root instead of /Dog-Map/.
  base: '/',
})
