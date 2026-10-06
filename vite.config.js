import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/tuefolk-repertoire/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'TüFolk Repertoire',
        short_name: 'TüFolk',
        description: 'TüFolk Sheet Music Repertoire App',
        theme_color: '#111827', 
        background_color: '#111827',
        display: 'standalone', 
        orientation: 'portrait',
        icons: [
          {
            src: 'TüFolk Logo.png', 
            sizes: '192x192 512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // FIX FOR SLOW LOADING:
        // We tell the Service Worker NOT to background-download gigabytes of audio and images.
        // It will only pre-download the fast, lightweight code files.
        globPatterns: ['**/*.{js,css,html,ico,svg,json}'], 
        maximumFileSizeToCacheInBytes: 100000000, 
        
        // Audio and Images are now cached AT RUNTIME (only when the user opens them)
        runtimeCaching: [
          {
            urlPattern: /\.(?:wav|mp3|m4a|mp4|png|jpg|jpeg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-runtime-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 24 * 60 * 60 // Keeps offline songs for 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
});