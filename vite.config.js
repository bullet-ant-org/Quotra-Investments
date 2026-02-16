import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This will expose the server on your network
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // This should be your backend server's URL
        changeOrigin: true,
      },
    },
  },
});