import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 5000,
    historyApiFallback: true,
    cors: {
      // the origin you will be accessing via browser
      origin: 'http://127.0.0.1:10000',
    },
  },
})
