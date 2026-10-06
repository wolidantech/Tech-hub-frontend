import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443
    },
    // Allow all hosts for Arena preview
    allowedHosts: true,
    // Dev-only same-origin route for the AI gateway, so a browser preview can
    // use VITE_DANTECH_ENDPOINT=/api/dantech/chat without CORS or mixed
    // content. Point it at the mock (npm run mock:ai) or a real gateway.
    // Production builds ignore this; they use the absolute endpoint URL.
    proxy: {
      '/api/dantech': {
        target: process.env.DANTECH_PROXY_TARGET || 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
})
