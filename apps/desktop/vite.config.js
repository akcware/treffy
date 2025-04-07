import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
});
