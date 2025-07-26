import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa'; // Disabled for Bolt.new compatibility

export default defineConfig({
  plugins: [
    react(),
    // VitePWA temporarily disabled due to Bolt.new compatibility issues
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     clientsClaim: true,
    //     skipWaiting: true
    //   }
    // }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});