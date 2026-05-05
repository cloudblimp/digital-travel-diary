import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ui': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion'],
          'toast': ['react-hot-toast'],
          'form': ['react-hook-form', 'zod'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'vite.config.*',
        'src/main.*',
        'src/firebase/**',
        'src/config/**',
        '**/*.css',
        '**/__tests__/**',
      ],
    },
  }
})
