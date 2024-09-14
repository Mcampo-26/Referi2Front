import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext', // O puedes usar 'es2022'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://https://main--referi2.netlify.app', // Cambia esto al puerto de tu backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
