import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? 'https://aaron.greider.org/Seafood-Dashboard/dist/' : '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          dir: './dist/',
          entryFileNames: 'script.js',
          assetFileNames: 'style.css',
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://mobile-api.junglejims.com/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});