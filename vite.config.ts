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
          // Only include the SVG, ignore favicon.ico to prevent V logo fallback
          includeAssets: ['icon.svg'], 
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
            // EXPLICITLY define standard sizes pointing to the SVG
            // This ensures mobile browsers pick up the icon correctly
            icons: [
              {
                src: '/icon.svg?v=2',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: '/icon.svg?v=2',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: '/icon.svg?v=2',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable'
              },
              {
                src: '/icon.svg?v=2',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any'
              }
            ],
            shortcuts: [
              {
                name: "Settings",
                short_name: "Settings",
                description: "Open System Settings",
                url: "/?app=settings",
                icons: [{ src: "/icon.svg?v=2", sizes: "192x192", type: "image/svg+xml" }]
              },
              {
                name: "AI Assistant",
                short_name: "Gemini",
                description: "Chat with Gemini AI",
                url: "/?app=gemini-assistant",
                icons: [{ src: "/icon.svg?v=2", sizes: "192x192", type: "image/svg+xml" }]
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