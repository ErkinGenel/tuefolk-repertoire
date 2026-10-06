import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // IMPORTANT: If your app is hosted at a subpath, uncomment the line below.
  // base: '/tuefolk-repertoire/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['**/*'],
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
        // Increased the maximum file size limit to ~100MB (100,000,000 bytes)
        // This stops the build from crashing when processing the 64MB .wav files.
        maximumFileSizeToCacheInBytes: 100000000, 
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,mp3,wav,m4a,json}']
      }
    })
  ],
});