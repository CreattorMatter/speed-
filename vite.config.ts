import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['html2canvas']
  },
  base: '/',
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    assetsDir: 'assets',
    commonjsOptions: {
      include: [/html2canvas/, /node_modules/]
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Mantener estructura de carpetas para imágenes
          if (assetInfo.name && assetInfo.name.includes('images/')) {
            return assetInfo.name;
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: 'public',
  server: {
    fs: {
      strict: false
    }
  }
});
