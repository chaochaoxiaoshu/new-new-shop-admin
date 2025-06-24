import path from 'path'
import { defineConfig } from 'vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/newmanage/',
  build: {
    outDir: 'dist/newmanage'
  },
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: 'src/pages',
      routeFileIgnorePattern: '.*/_lib/.*|.*/_components/.*'
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '18' }]]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://shop.shanshu.work',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
