import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // garante que index.html da raiz seja usado
  build: {
    outDir: 'dist',
  },
});
