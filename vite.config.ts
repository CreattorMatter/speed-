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
  build: {
    commonjsOptions: {
      include: [/html2canvas/, /node_modules/]
    }
  }
});
