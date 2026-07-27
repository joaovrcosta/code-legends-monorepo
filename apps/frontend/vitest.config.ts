import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: [
      'src/lib/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'src/components/classroom/lab/lab-playground/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    environment: 'node',
  },
})
