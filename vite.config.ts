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
            description: 'A professional web-based desktop environment with integrated AI tools.',
            theme_color: '#050505',
            background_color: '#050505',
            display: 'standalone',
            display_override: ["window-controls-overlay", "standalone"],
            orientation: 'any',
            start_url: '/',
            id: '/',
            // PC Optimization: Screenshots allow the install prompt to look like a Store App
            screenshots: [
              {
                src: "https://upload.cc/i1/2025/12/12/1TC9NI.jpg",
                sizes: "1920x1080",
                type: "image/jpg",
                form_factor: "wide",
                label: "CloudOS Desktop Interface"
              },
              {
                src: "https://upload.cc/i1/2025/12/12/1TC9NI.jpg",
                sizes: "1920x1080",
                type: "image/jpg",
                form_factor: "narrow", // Fallback for mobile views
                label: "CloudOS Mobile View"
              }
            ],
            icons: [
              {
                src: '/favicon.ico',
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/x-icon'
              },
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any' // 'any' keeps transparency for desktop icons
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable' // 'maskable' fills the square (Android/Windows Tiles)
              }
            ],
            shortcuts: [
              {
                name: "Settings",
                short_name: "Settings",
                description: "Open System Settings",
                url: "/?app=settings",
                icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
              },
              {
                name: "AI Assistant",
                short_name: "Gemini",
                description: "Chat with Gemini AI",
                url: "/?app=gemini-assistant",
                icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
              }
            ],
            categories: ["productivity", "utilities", "personalization"],
            launch_handler: {
                client_mode: "auto"
            },
            edge_side_panel: {
                preferred_width: 480
            }
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