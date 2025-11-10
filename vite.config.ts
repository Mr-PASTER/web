import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const base = process.env.BASE_URL ?? '/';

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://backend-web-7mkm.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Убираем /api префикс
          let newPath = path.replace(/^\/api/, '');
          // Если путь /projects без trailing slash и без query, добавляем его
          // Если есть query параметры, добавляем слеш перед ?
          if (newPath === '/projects') {
            return '/projects/';
          }
          if (newPath.startsWith('/projects?')) {
            return newPath.replace('/projects?', '/projects/?');
          }
          return newPath;
        },
        configure: (proxy, _options) => {
          // Настраиваем прокси для автоматического следования редиректам
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Если сервер возвращает редирект, переписываем location header
            if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308) {
              const location = proxyRes.headers.location;
              if (location && location.startsWith('/')) {
                // Переписываем редирект через прокси
                proxyRes.headers.location = `/api${location}`;
              }
            }
          });
        },
      },
    },
  },
});

