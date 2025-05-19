import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/documents': 'http://127.0.0.1:8000',
      '/question': 'http://127.0.0.1:8000',
      '/documents/upload': 'http://127.0.0.1:8000',
    },
  },
});
