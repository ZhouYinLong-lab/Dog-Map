import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [react()],
  base: repositoryName ? `/${repositoryName}/` : '/',
})
