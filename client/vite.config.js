import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, requests to /api are forwarded to the Express server.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000', '/uploads': 'http://localhost:5000', '/socket.io': { target: 'http://localhost:5000', ws: true } } },
})
