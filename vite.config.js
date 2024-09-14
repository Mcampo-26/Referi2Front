import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { URL } from './src/utilities/config';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext', // o 'es2022'
    supported: {
      'top-level-await': true, // Habilitar top-level await
    },
  },
  server: {
    proxy: {
      '/api': {
        target: URL, // Asegúrate de que esta sea la URL correcta
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
