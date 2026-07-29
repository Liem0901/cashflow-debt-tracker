import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');

  return {
  publicDir: 'frontend/public',
  assetsInclude: ['**/*.glb'],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Cashflow & Debt Tracker',
        short_name: 'Cashflow',
        description: 'Track cashflow, expenses, and debt. Know your safe-to-spend balance.',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('firebase')) return 'firebase';
          if (id.includes('recharts') || id.includes('d3-')) return 'recharts';
          if (id.includes('framer-motion')) return 'framer-motion';
          if (
            id.includes('node_modules/three/') ||
            id.includes('three-stdlib') ||
            id.includes('three-mesh-bvh')
          ) {
            return 'three';
          }
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('@react-three') ||
            id.includes('/react/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_URL || 'http://127.0.0.1:3005',
        changeOrigin: true,
      },
    },
  },
};
});
