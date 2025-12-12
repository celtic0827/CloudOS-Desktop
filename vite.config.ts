import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          devOptions: {
            enabled: true
          },
          manifest: {
            name: 'CloudOS Desktop',
            short_name: 'CloudOS',
            description: 'A web-based desktop environment',
            theme_color: '#050505',
            background_color: '#050505',
            display: 'standalone',
            orientation: 'any',
            start_url: '/',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            // Shortcuts allow right-click menu on the app icon in OS
            shortcuts: [
              {
                name: "Settings",
                short_name: "Settings",
                description: "Open System Settings",
                url: "/?app=settings",
                icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
              }
            ],
            categories: ["productivity", "utilities", "personalization"]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});