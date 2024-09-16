import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { URL } from './src/utilities/config'; // Asegúrate de que el archivo de configuración esté correctamente configurado.

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext', // O 'es2022' para soporte moderno
  },
  build: {
    target: 'esnext', // Asegura compatibilidad con top-level await
    rollupOptions: {
      output: {
        format: 'esm', // Utiliza el formato de módulos ES
      },
    },
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
