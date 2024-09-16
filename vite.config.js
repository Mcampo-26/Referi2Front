import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { URL } from './src/utilities/config'; // Asegúrate de que el archivo de configuración esté correctamente configurado.

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext', // O puedes usar 'es2022'
  },
  server: {
    proxy: {
      '/api': {
        target: URL, // URL del backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
