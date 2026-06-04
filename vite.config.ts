import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/learning-island/',
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
});
