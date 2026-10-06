import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // IMPORTANT: If your app is hosted at https://erkingenel.github.io/tuefolk-repertoire/
  // you must uncomment the line below and set it to your repository name:
  base: '/tuefolk-repertoire/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['**/*'], // Caches all public assets for offline use
      manifest: {
        name: 'TüFolk Repertoire',
        short_name: 'TüFolk',
        description: 'TüFolk Sheet Music Repertoire App',
        theme_color: '#111827', // Tailwind gray-900 to match your app header
        background_color: '#111827',
        display: 'standalone', // Makes it look like a native app (hides browser UI)
        orientation: 'portrait',
        icons: [
          {
            src: 'TüFolk Logo.png', // Uses your existing logo as the app icon
            sizes: '192x192 512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Increases the maximum file size limit for caching to 10MB
        // This ensures high-quality sheet music images and sounds are successfully downloaded for offline mode.
        maximumFileSizeToCacheInBytes: 10000000, 
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,mp3,wav,m4a,json}']
      }
    })
  ],
});