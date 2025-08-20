import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES ? '/ToolVault/' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    fs: {
      // Allow serving files from parent directory
      allow: ['..'],
    },
  },
  publicDir: 'public',
  // Copy examples directory to public during build
  define: {
    // Define base path for different environments
    __BASE_PATH__: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES ? '"/ToolVault/"' : '"/"',
  },
})
