import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteCommonjs()
  ],
  optimizeDeps: {
    include: [
      'object-assign',
      'point-in-polygon',
      'rbush',
      'earcut',
      'geojson-rbush'
    ],
    exclude: ['vue-leaflet'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'deep-equal': 'fast-deep-equal',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // 1MB limit, isteğe göre artırabilirsin
  },
})
