import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    dedupe: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/component',
      '@firebase/util',
    ],
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  server: {
    hmr: false,
    ws: false,
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
